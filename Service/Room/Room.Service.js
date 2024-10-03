const ROOM_MODEL = require("../../Model/Room/Room.Model");
const METADATA_ROOM_SERVICE = require("../../Service/MetadataRoom/MetadataRoom.Service");
const CLOUDINARY = require("../../Config/cloudinaryConfig");
const mongoose = require("mongoose");

class ROOM_SERVICE {
  async addRooms(roomData, quantity) {
    try {
      const roomsToAdd = [];

      for (let i = 0; i < quantity; i++) {
        // Tạo lịch trống trong 1 tháng cho mỗi phòng
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const availability = [];
        let currentDate = startDate;

        while (currentDate <= endDate) {
          availability.push({
            DATE: new Date(currentDate),
            AVAILABLE: true,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // **Upload ảnh lên Cloudinary**
        let uploadedImages = [];
        if (roomData.IMAGES && roomData.IMAGES.length > 0) {
          uploadedImages = await Promise.all(
            roomData.IMAGES.map(async (image) => {
              if (image.startsWith("http")) {
                const uploadResult = await CLOUDINARY.uploader.upload(image);
                return uploadResult.secure_url;
              } else {
                const uploadResult = await CLOUDINARY.uploader.upload(
                  image.path
                );
                return uploadResult.secure_url;
              }
            })
          );
        }

        // Tạo ROOM_NUMBER
        const roomNumber = await this.generateRoomNumber(
          roomData.FLOOR,
          roomData.HOTEL_ID
        );

        // Tạo dữ liệu phòng mới mà không gán ROOM_NUMBER, để middleware xử lý
        const newRoomData = {
          HOTEL_ID: roomData.HOTEL_ID,
          ROOM_NUMBER: roomNumber,
          FLOOR: roomData.FLOOR,
          TYPE: roomData.TYPE,
          PRICE_PERNIGHT: roomData.PRICE_PERNIGHT,
          DESCRIPTION: roomData.DESCRIPTION,
          IMAGES: uploadedImages,
          AVAILABILITY: availability,
          CUSTOM_ATTRIBUTES: roomData.CUSTOM_ATTRIBUTES,
        };

        // Save từng phòng một, middleware sẽ xử lý ROOM_NUMBER
        const newRoom = new ROOM_MODEL(newRoomData);
        await newRoom.save(); // Gọi middleware pre('save') để thiết lập ROOM_NUMBER
        roomsToAdd.push(newRoom);
      }

      // Cập nhật MetadataHotel
      await METADATA_ROOM_SERVICE.updateMetadataHotelAfterRoomAdded(
        roomData.HOTEL_ID,
        roomData.TYPE,
        quantity
      );

      return roomsToAdd;
    } catch (error) {
      throw new Error("Error adding rooms: " + error.message);
    }
  }

  async generateRoomNumber(floor, hotelId) {
    try {
      // Tìm ROOM_NUMBER lớn nhất trên tầng hiện tại
      const latestRoom = await ROOM_MODEL.findOne({
        FLOOR: floor,
        HOTEL_ID: hotelId,
      }).sort({ ROOM_NUMBER: -1 });

      // Thiết lập ROOM_NUMBER tiếp theo
      const roomNumberSuffix = latestRoom
        ? parseInt(latestRoom.ROOM_NUMBER.slice(-2)) + 1
        : 1; // Số phòng tiếp theo
      const floorPrefix = floor.toString();

      // Ghép FLOOR và ROOM_NUMBER thành ROOM_NUMBER đầy đủ
      const newRoomNumber = `${floorPrefix}${roomNumberSuffix
        .toString()
        .padStart(2, "0")}`;

      return newRoomNumber;
    } catch (error) {
      throw new Error("Error generating ROOM_NUMBER: " + error.message);
    }
  }

  async deleteRoom(roomId) {
    const room = await ROOM_MODEL.findByIdAndUpdate(
      roomId,
      { IS_DELETED: true },
      { new: true }
    );
    return room;
  }

  async updateRoom(roomId, updateData) {
    const room = await ROOM_MODEL.findByIdAndUpdate(roomId, updateData, {
      new: true,
    });
    return room;
  }

  async getRoomsById(roomId) {
    const room = await ROOM_MODEL.findById(roomId);
    return room;
  }

  async findRoomsByHotel(hotelId) {
    const rooms = await ROOM_MODEL.find({
      HOTEL_ID: hotelId,
      IS_DELETED: false,
    });
    return rooms;
  }

  async getAllRoomsInHotel(hotelId) {
    const rooms = await ROOM_MODEL.find({
      HOTEL_ID: hotelId,
      IS_DELETED: false,
    });
    return rooms;
  }

  async getAvailableRooms(hotelId, startDate, endDate) {
    const objectId = new mongoose.Types.ObjectId(hotelId);
    const start = new Date(startDate);
    const end = new Date(endDate);

    const availableRooms = await ROOM_MODEL.aggregate([
      {
        $match: {
          HOTEL_ID: objectId,
          IS_DELETED: false,
        },
      },
      {
        $lookup: {
          from: "bookings", // Tên của collection Booking
          let: { roomId: "$_id", startDate: start, endDate: end },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $gt: ["$LIST_ROOMS.END_DATE", "$$startDate"], // Ngày kết thúc phải lớn hơn ngày bắt đầu
                    },
                    {
                      $lt: ["$LIST_ROOMS.START_DATE", "$$endDate"], // Ngày bắt đầu phải nhỏ hơn ngày kết thúc
                    },
                    {
                      $in: ["$$roomId", "$LIST_ROOMS.ROOM_ID"], // So sánh với roomId
                    },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                roomId: "$LIST_ROOMS.ROOM_ID",
              },
            },
          ],
          as: "bookedRooms",
        },
      },
      {
        $match: {
          bookedRooms: { $eq: [] }, // Chỉ giữ lại các phòng không có booking
        },
      },
      {
        $project: {
          roomNumber: "$ROOM_NUMBER",
          availability: "$AVAILABILITY",
          IMAGES: 1, // Lấy tất cả các thông tin có trong phòng
          TYPE: 1,
          CUSTOM_ATTRIBUTES: 1, // Các thuộc tính như bedType, area,...
          PRICE_PERNIGHT: 1,
          DESCRIPTION: 1
        },
      },
    ]);

    return availableRooms;
  }

  async searchRooms(hotelId, checkInDate, checkOutDate, numberOfRooms) {
    console.log(`Hotel ID: ${hotelId}`);

    // Chuyển đổi hotelId thành ObjectId
    const objectId = new mongoose.Types.ObjectId(hotelId);

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Tính số ngày giữa checkInDate và checkOutDate
    const numberOfDays = Math.ceil(
      (checkOut - checkIn) / (1000 * 60 * 60 * 24)
    );

    // Kiểm tra số ngày
    console.log(`Number of Days: ${numberOfDays}`);

    const rooms = await ROOM_MODEL.aggregate([
      {
        $match: {
          HOTEL_ID: objectId,
          IS_DELETED: false,
        },
      },
      {
        $addFields: {
          availableDates: {
            $filter: {
              input: "$AVAILABILITY",
              as: "availability",
              cond: {
                $and: [
                  { $gte: ["$$availability.DATE", checkIn] },
                  {
                    $lt: [
                      "$$availability.DATE",
                      new Date(checkOut.getTime() + 24 * 60 * 60 * 1000),
                    ],
                  },
                  { $eq: ["$$availability.AVAILABLE", true] },
                ],
              },
            },
          },
          availableDatesCount: {
            $size: {
              $filter: {
                input: "$AVAILABILITY",
                as: "availability",
                cond: {
                  $and: [
                    { $gte: ["$$availability.DATE", checkIn] },
                    {
                      $lt: [
                        "$$availability.DATE",
                        new Date(checkOut.getTime() + 24 * 60 * 60 * 1000),
                      ],
                    },
                    { $eq: ["$$availability.AVAILABLE", true] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $match: {
          availableDatesCount: {
            $gte: numberOfDays,
          },
        },
      },
      {
        $project: {
          ROOM_NUMBER: 1,
          FLOOR: 1,
          TYPE: 1,
          PRICE_PERNIGHT: 1,
          DESCRIPTION: 1,
          IMAGES: 1,
          AVAILABILITY: 1,
          CUSTOM_ATTRIBUTES: 1,
          DEPOSIT_PERCENTAGE: 1,
          // availableDates: 1,
        },
      },
    ]);

    return rooms;
  }

  async getAllRoomsWithCartStatus(hotelId, userId) {
    const hotelObjectId = new mongoose.Types.ObjectId(hotelId);
    const rooms = await ROOM_MODEL.aggregate([
      {
        $match: { HOTEL_ID: hotelObjectId }, // Lọc tất cả các phòng của khách sạn
      },
      {
        $lookup: {
          from: "carts", // Collection giỏ hàng
          let: { roomId: "$_id" }, // Đặt biến roomId từ _id của room
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$USER_ID", new mongoose.Types.ObjectId(userId)] }, // Kiểm tra USER_ID trùng khớp
                    {
                      $in: ["$$roomId", "$ROOMS.ROOM_ID"], // Kiểm tra roomId có trong giỏ hàng không
                    },
                  ],
                },
              },
            },
          ],
          as: "cartDetails",
        },
      },
      {
        $addFields: {
          IS_IN_CART: { $gt: [{ $size: "$cartDetails" }, 0] }, // Nếu có dữ liệu trong cartDetails thì IS_IN_CART là true
        },
      },
      {
        $project: {
          cartDetails: 0, // Ẩn trường cartDetails
        },
      },
    ]);

    return rooms;
  }
}

module.exports = new ROOM_SERVICE();
