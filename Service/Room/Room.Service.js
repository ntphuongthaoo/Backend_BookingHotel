const ROOM_MODEL = require("../../Model/Room/Room.Model");
const METADATA_ROOM_SERVICE = require("../../Service/MetadataRoom/MetadataRoom.Service");
const CLOUDINARY = require("../../Config/cloudinaryConfig");
const mongoose = require("mongoose");

class ROOM_SERVICE {
  async addRooms(roomData, quantity) {
    try {
      const roomsToAdd = [];

      // Lấy số phòng lớn nhất hiện có trên tầng đó
      let startingRoomNumber = await this.findLargestRoomNumberOnFloor(
        roomData.FLOOR
      );

      if (!startingRoomNumber) {
        startingRoomNumber = 1;
      } else {
        startingRoomNumber += 1;
      }

      for (let i = 0; i < quantity; i++) {
        let roomNumber = startingRoomNumber + i;

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
        let uploadedImages = []; // Đảm bảo biến được định nghĩa trước
        if (roomData.IMAGES && roomData.IMAGES.length > 0) {
          uploadedImages = await Promise.all(
            roomData.IMAGES.map(async (image) => {
              // Kiểm tra nếu là URL hoặc file path cục bộ
              if (image.startsWith("http")) {
                // Upload từ URL
                const uploadResult = await CLOUDINARY.uploader.upload(image);
                return uploadResult.secure_url;
              } else {
                // Upload từ file cục bộ
                const uploadResult = await CLOUDINARY.uploader.upload(
                  image.path
                );
                return uploadResult.secure_url;
              }
            })
          );
        }

        // Tạo dữ liệu phòng mới với lịch trống trong 1 tháng
        const newRoomData = {
          HOTEL_ID: roomData.HOTEL_ID,
          ROOM_NUMBER: roomNumber,
          FLOOR: roomData.FLOOR,
          TYPE: roomData.TYPE,
          PRICE_PERNIGHT: roomData.PRICE_PERNIGHT,
          DESCRIPTION: roomData.DESCRIPTION,
          IMAGES: uploadedImages, // Lưu URL của ảnh từ Cloudinary
          AVAILABILITY: availability,
          CUSTOM_ATTRIBUTES: roomData.CUSTOM_ATTRIBUTES,
          DEPOSIT_PERCENTAGE: roomData.DEPOSIT_PERCENTAGE,
        };

        // Save từng phòng một
        const newRoom = new ROOM_MODEL(newRoomData);
        await newRoom.save();
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

  async findLargestRoomNumberOnFloor(floor) {
    try {
      // Tìm tất cả các phòng trên tầng được chỉ định
      const roomsOnFloor = await ROOM_MODEL.find({ FLOOR: floor })
        .sort({ ROOM_NUMBER: -1 })
        .limit(1);

      // Nếu không có phòng nào trên tầng, trả về null
      if (roomsOnFloor.length === 0) {
        return null;
      }

      // Lấy số phòng lớn nhất (ROOM_NUMBER của phòng đầu tiên trong kết quả)
      const largestRoomNumber = parseInt(roomsOnFloor[0].ROOM_NUMBER);

      // Trả về số phòng lớn nhất
      return largestRoomNumber;
    } catch (error) {
      throw new Error("Error finding largest room number: " + error.message);
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

  async findRoomsById(roomId) {
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

  async listAvailableRooms(hotelId, date) {
    const rooms = await ROOM_MODEL.find({
      HOTEL_ID: hotelId,
      IS_DELETED: false,
      "AVAILABILITY.DATE": date,
      "AVAILABILITY.AVAILABLE": true,
    });

    return rooms;
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
                  { $lt: ["$$availability.DATE", new Date(checkOut.getTime() + 24 * 60 * 60 * 1000)] },
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
                    { $lt: ["$$availability.DATE", new Date(checkOut.getTime() + 24 * 60 * 60 * 1000)] },
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
}

module.exports = new ROOM_SERVICE();
