const ROOM_SERVICE = require("../../Service/Room/Room.Service");
const ROOM_VALIDATED = require("../../Model/Room/validate/validateRoom");
const METADATA_ROOM_SERVICE = require("../../Service/MetadataRoom/MetadataRoom.Service");

class ROOM_CONTROLLER {
  async createRoom(req, res) {
    const { roomData, quantity } = req.body;

    const { error } = ROOM_VALIDATED.createRoom.validate(roomData, {
      abortEarly: false,
    });

    if (error) {
      // Nếu có lỗi validate, trả về phản hồi lỗi
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    try {
      // **Upload ảnh từ request nếu có**
      if (req.files && req.files.length > 0) {
        const images = req.files.map((file) => ({ path: file.path })); // Lấy đường dẫn tạm thời từ Multer
        roomData.IMAGES = images;
      }
      // Nếu validate thành công, gọi dịch vụ để thêm phòng
      const rooms = await ROOM_SERVICE.addRooms(roomData, quantity);
      return res.status(201).json({
        success: true,
        message: "Rooms added successfully",
        rooms: rooms,
      });
    } catch (error) {
      console.error("Detailed error adding rooms:", error); // In chi tiết lỗi
      // Xử lý lỗi nếu có khi thêm phòng
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteRoom(req, res) {
    try {
      const roomId = req.params.roomId;

      // Xóa phòng khỏi cơ sở dữ liệu
      const room = await ROOM_SERVICE.deleteRoom(roomId);

      if (room) {
        // Cập nhật MetadataHotel sau khi phòng bị xóa
        await METADATA_ROOM_SERVICE.updateMetadataAfterRoomRemoved(
          room.HOTEL_ID,
          room.TYPE
        );
      }

      return res.status(200).json({
        message: "Room deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error deleting room: " + error.message,
      });
    }
  }

  async updateRoom(req, res) {
    try {
      const roomId = req.params.roomId;
      const updateData = req.body;

      const room = await ROOM_SERVICE.updateRoom(roomId, updateData);

      return res.status(200).json({
        success: true,
        message: "Room updated successfully",
        room: room,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error updating room: " + error.message,
      });
    }
  }

  async findRoomsByHotel(req, res) {
    try {
      const hotelId = req.params.hotelId;
      const rooms = await ROOM_SERVICE.findRoomsByHotel(hotelId);

      return res.status(200).json({
        success: true,
        rooms: rooms,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: "Error finding rooms: " + error.message,
      });
    }
  }

  async listAvailableRooms(req, res) {
    try {
      const { hotelId, date } = req.query;
      const availableRooms = await ROOM_SERVICE.listAvailableRooms(
        hotelId,
        date
      );

      return res.status(200).json({
        success: true,
        rooms: availableRooms,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error listing available rooms: " + error.message,
      });
    }
  }
}

module.exports = new ROOM_CONTROLLER();
