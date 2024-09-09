const ROOM_MODEL = require("../../Model/Room/Room.Model");
const METADATA_ROOM_SERVICE = require("../../Service/MetadataRoom/MetadataRoom.Service");

class ROOM_SERVICE {
  async addRooms(roomData, quantity) {
    try {
      const roomsToAdd = [];
      
      for (let i = 0; i < quantity; i++) {
        let roomNumber = roomData.ROOM_NUMBER + i;
        
        // Kiểm tra và điều chỉnh ROOM_NUMBER nếu phòng đã tồn tại
        roomNumber = await this.findAvailableRoomNumber(roomData.FLOOR, roomNumber);

        // Tạo phòng mới
        const newRoomData = {
          HOTEL_ID: roomData.HOTEL_ID,
          ROOM_NUMBER: roomNumber,
          FLOOR: roomData.FLOOR,
          TYPE: roomData.TYPE,
          PRICE_PERNIGHT: roomData.PRICE_PERNIGHT,
          DESCRIPTION: roomData.DESCRIPTION,
          IMAGES: roomData.IMAGES,
          AVAILABILITY: [
            {
              DATE: new Date(),
              AVAILABLE: true
            }
          ],
          CUSTOM_ATTRIBUTES: roomData.CUSTOM_ATTRIBUTES,
          DEPOSIT_PERCENTAGE: roomData.DEPOSIT_PERCENTAGE,
          // DISCOUNT: roomData.DISCOUNT
        };

        // Save từng phòng một
        const newRoom = new ROOM_MODEL(newRoomData);
        await newRoom.save(); // Chạy middleware save
        roomsToAdd.push(newRoom);
      }

      // Sau khi tất cả phòng đã được thêm, cập nhật MetadataHotel
      await METADATA_ROOM_SERVICE.updateMetadataHotelAfterRoomAdded(roomData.HOTEL_ID, roomData.TYPE, quantity);
      
      return roomsToAdd;
    } catch (error) {
      throw new Error('Error adding rooms: ' + error.message);
    }
  }

  // Hàm tìm ROOM_NUMBER khả dụng
  async findAvailableRoomNumber(floor, roomNumber) {
    let existingRoom = await ROOM_MODEL.findOne({ FLOOR: floor, ROOM_NUMBER: roomNumber });
    let increment = 1;
    
    while (existingRoom) {
      roomNumber += increment;
      existingRoom = await ROOM_MODEL.findOne({ FLOOR: floor, ROOM_NUMBER: roomNumber });
      increment++;
    }
    
    return roomNumber;
  }
}

module.exports = new ROOM_SERVICE();
