const HOTEL_MODEL = require("../../Model/Hotel/Hotel.Model");
const CLOUDINARY = require("../../Config/cloudinaryConfig");
const REVIEW_MODEL = require("../../Model/Review/Review.Model");
const ROOM_MODEL = require("../../Model/Room/Room.Model");
const BOOKING_MODEL = require("../../Model/Booking/Booking.Model");

class HOTEL_SERVICE {
  async createHotel(data) {
    let uploadedImages = [];

    if (data.IMAGES && data.IMAGES.length > 0) {
      uploadedImages = await Promise.all(
        data.IMAGES.map(async (image) => {
          if (typeof image === "string" && image.startsWith("http")) {
            // Upload từ URL
            const uploadResult = await CLOUDINARY.uploader.upload(image);
            return uploadResult.secure_url;
          } else if (image.path) {
            // Upload từ file cục bộ
            const uploadResult = await CLOUDINARY.uploader.upload(image.path);
            return uploadResult.secure_url;
          }
        })
      );

      // Gán danh sách ảnh đã upload vào trường IMAGES trong data
      data.IMAGES = uploadedImages;
    }

    const newHotel = new HOTEL_MODEL(data);
    const result = await newHotel.save();

    return result.toObject();
  }

  async updateHotelById(id, hotelData) {
    let uploadedImages = [];

    if (hotelData.IMAGES && hotelData.IMAGES.length > 0) {
      uploadedImages = await Promise.all(
        hotelData.IMAGES.map(async (image) => {
          if (typeof image === "string" && image.startsWith("http")) {
            // Nếu là URL thì giữ nguyên
            return image;
          } else if (image.path) {
            // Nếu là file cục bộ, upload lên Cloudinary
            const uploadResult = await CLOUDINARY.uploader.upload(image.path);
            return uploadResult.secure_url;
          }
        })
      );

      // Gán danh sách ảnh đã upload vào trường IMAGES trong hotelData
      hotelData.IMAGES = uploadedImages;
    }

    const updateHotel = await HOTEL_MODEL.findByIdAndUpdate(
      id,
      {
        ...hotelData,
      },
      { new: true }
    );

    return updateHotel;
  }

  async deleteHotel(hotelId) {
    const result = await HOTEL_MODEL.findByIdAndUpdate(
      hotelId,
      { $set: { IS_DELETED: true, STATE: false } },
      { new: true, runValidators: true } // `new: true` để trả về tài liệu đã cập nhật
    );
    if (!result) {
      throw new Error("Hotel not found");
    }
    return result.toObject();
  }

  async getAllHotels() {
    // Tìm tất cả các khách sạn
    const hotels = await HOTEL_MODEL.find({});
    return hotels;
  }

  async getHotelById(hotelId) {
    const hotel = await HOTEL_MODEL.findById(hotelId);
    return hotel;
  }

  async getHotelsAndSearch(tabStatus, page, limit, search = "", userRole = "") {
    // Xây dựng query cơ bản
    let matchStage = {};
    let matchDeletedStage = {}; // Để lọc khách sạn đã bị xóa

    switch (tabStatus) {
      case "1":
        matchStage = { STATE: true, IS_DELETED: false };
        break;
      case "2":
        matchStage = { STATE: false, IS_DELETED: false };
        break;
      case "3":
        matchDeletedStage = { IS_DELETED: true };
        break;
      case "4":
        matchStage = {};
        matchDeletedStage = {};
        break;
      default:
        throw new Error("Invalid tab status");
    }

    // Điều kiện tìm kiếm chung
    if (search) {
      matchStage.$or = [
        { NAME: { $regex: new RegExp(search, "i") } },
        { "ADDRESS.PROVINCE.NAME": { $regex: new RegExp(search, "i") } },
        { "ADDRESS.DISTRICT.NAME": { $regex: new RegExp(search, "i") } },
        { "ADDRESS.WARD.NAME": { $regex: new RegExp(search, "i") } },
      ];
    }

    try {
      // Đếm tổng số tài liệu
      let totalCount = 0;
      if (Object.keys(matchStage).length > 0) {
        totalCount = await HOTEL_MODEL.aggregate([
          { $match: matchStage },
          { $count: "totalCount" },
        ]);
      } else if (
        Object.keys(matchDeletedStage).length > 0 &&
        (userRole === "ADMIN" || userRole === "BRANCH_MANAGER")
      ) {
        totalCount = await HOTEL_MODEL.aggregate([
          { $match: matchDeletedStage },
          { $count: "totalCount" },
        ]);
      }

      const totalCountValue =
        totalCount.length > 0 ? totalCount[0].totalCount : 0;
      const totalPages = Math.ceil(totalCountValue / limit);
      const offset = (page - 1) * limit;

      // Truy vấn khách sạn
      let hotels = [];
      if (Object.keys(matchStage).length > 0) {
        hotels = await HOTEL_MODEL.aggregate([
          { $match: matchStage },
          { $skip: offset },
          { $limit: limit },
        ]).exec();
      } else if (
        Object.keys(matchDeletedStage).length > 0 &&
        (userRole === "ADMIN" || userRole === "BRANCH_MANAGER")
      ) {
        hotels = await HOTEL_MODEL.aggregate([
          { $match: matchDeletedStage },
          { $skip: offset },
          { $limit: limit },
        ]).exec();
      }

      return {
        hotels,
        totalPages,
        totalCount: totalCountValue,
      };
    } catch (error) {
      console.error("Error querying hotels:", error);
      throw new Error("Lỗi khi truy vấn khách sạn");
    }
  }

  async getServiceInHotel(hotelId) {
    const service = await HOTEL_MODEL.findById(hotelId).select("SERVICES");
    return service;
  }

  async getHotelsName() {
    return await HOTEL_MODEL.find({}, "NAME");
  }

  async toggleAllServicesInGroup(hotelId, serviceGroup, status) {
    // Tạo một object update cho tất cả các dịch vụ trong nhóm
    const update = {};
    const hotel = await HOTEL_MODEL.findById(hotelId);
    if (!hotel) throw new Error("Hotel not found");

    // Lặp qua từng dịch vụ con trong nhóm
    for (const field in hotel.SERVICES[serviceGroup]) {
      if (hotel.SERVICES[serviceGroup][field].enabled !== undefined) {
        update[`SERVICES.${serviceGroup}.${field}.enabled`] = status;
      }
    }

    const updatedHotel = await HOTEL_MODEL.findByIdAndUpdate(
      hotelId,
      { $set: update },
      { new: true }
    );

    console.log(`Updated all services in ${serviceGroup} to ${status}`);
    return updatedHotel;
  }

  async updateAllServiceFields(hotelId, services) {
    try {
      const update = {};
      for (const serviceGroup in services) {
        for (const serviceField in services[serviceGroup]) {
          update[`SERVICES.${serviceGroup}.${serviceField}.enabled`] = services[serviceGroup][serviceField].enabled;
        }
      }
  
      const updatedHotel = await HOTEL_MODEL.findByIdAndUpdate(
        hotelId,
        { $set: update },
        { new: true }
      );
  
      if (!updatedHotel) {
        throw new Error("Hotel not found");
      }
  
      return updatedHotel;
    } catch (error) {
      console.error("Error updating all service fields:", error);
      throw error;
    }
  }

  async calculateAverageRatingForHotel(hotelId) {
    const rooms = await ROOM_MODEL.find({ HOTEL_ID: hotelId }).select('_id');

    // Tạo danh sách các ID của phòng
    const roomIds = rooms.map(room => room._id);

    // Tìm tất cả các đánh giá của các phòng thuộc khách sạn, với STATUS = true
    const reviews = await REVIEW_MODEL.find({
      ROOM_ID: { $in: roomIds },
      STATUS: true
    });

    // Nếu không có đánh giá nào, trả về 0
    if (reviews.length === 0) return 0;

    // Tính toán số sao trung bình
    const averageRating = reviews.reduce((acc, review) => acc + review.RATING, 0) / reviews.length;

    return averageRating;
  }

  async getTopBookedHotels() {
    const bookings = await BOOKING_MODEL.aggregate([
      {
        $match: {
          STATUS: { $in: ["Booked", "CheckedOut"] } 
        }
      },
      {
        $unwind: "$LIST_ROOMS" // Giải nén LIST_ROOMS để lấy từng ROOM_ID
      },
      {
        $lookup: {
          from: "rooms", // Kết nối với collection rooms
          localField: "LIST_ROOMS.ROOM_ID",
          foreignField: "_id",
          as: "roomDetails"
        }
      },
      {
        $unwind: "$roomDetails" // Giải nén roomDetails để lấy HOTEL_ID
      },
      {
        $group: {
          _id: "$roomDetails.HOTEL_ID", // Nhóm theo HOTEL_ID
          bookingCount: { $sum: 1 } // Đếm số lần đặt phòng thành công cho mỗi khách sạn
        }
      },
      {
        $sort: { bookingCount: -1 } // Sắp xếp theo số lượt đặt phòng giảm dần
      },
      {
        $limit: 3 // Giới hạn chỉ lấy 3 khách sạn có lượt đặt nhiều nhất
      },
      {
        $lookup: {
          from: "hotels",
          localField: "_id",
          foreignField: "_id",
          as: "hotelDetails"
        }
      },
      {
        $unwind: "$hotelDetails"
      },
      {
        $project: {
          _id: "$hotelDetails._id",
          NAME: "$hotelDetails.NAME",
          IMAGES: "$hotelDetails.IMAGES",
          RATING: "$hotelDetails.RATING",
          ADDRESS: "$hotelDetails.ADDRESS",
          bookingCount: 1
        }
      }
    ]);
  
    return bookings;
  }
  
}

module.exports = new HOTEL_SERVICE();
