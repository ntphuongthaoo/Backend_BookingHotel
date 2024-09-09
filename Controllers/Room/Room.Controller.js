const ROOM_SERVICE = require("../../Service/Room/Room.Service");
const ROOM_VALIDATED = require("../../Model/Room/validate/validateRoom");

class ROOM_CONTROLLER {
  async createRoom(req, res) {
    const { roomData, quantity } = req.body;

    const { error } = ROOM_VALIDATED.createRoom.validate(roomData, { abortEarly: false });

    if (error) {
      // Nếu có lỗi validate, trả về phản hồi lỗi
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }

    try {
      // Nếu validate thành công, gọi dịch vụ để thêm phòng
      const rooms = await ROOM_SERVICE.addRooms(roomData, quantity);
      return res.status(201).json({
        success: true,
        message: "Rooms added successfully",
        rooms: rooms,
      });
    } catch (error) {
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
      const room = await RoomService.deleteRoom(roomId);

      if (room) {
        const hotelId = room.HOTEL_ID;
        const roomType = room.TYPE;

        // Cập nhật MetadataHotel sau khi phòng bị xóa
        await MetadataRoomService.updateMetadataAfterRoomRemoved(hotelId, roomType);
      }

      return res.status(200).json({
        message: 'Room deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error deleting room: ' + error.message
      });
    }
  }
}

module.exports = new ROOM_CONTROLLER();
