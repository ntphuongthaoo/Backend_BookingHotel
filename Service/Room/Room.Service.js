const ROOM_MODEL = require("../../Model/Room/Room.Model");

class ROOM_SERVICE {
  async addRooms(roomData, quantity) {
    try {
      const roomsToAdd = [];
      
      for (let i = 0; i < quantity; i++) {
        let roomNumber = roomData.ROOM_NUMBER + i;
        
        // Kiểm tra xem phòng đã tồn tại chưa
        let existingRoom = await ROOM_MODEL.findOne({ FLOOR: roomData.FLOOR, ROOM_NUMBER: roomNumber });
        
        if (existingRoom) {
          // Nếu phòng đã tồn tại, tiếp tục kiểm tra phòng kế tiếp
          let increment = 1;
          while (existingRoom) {
            roomNumber = roomData.ROOM_NUMBER + i + increment;
            existingRoom = await ROOM_MODEL.findOne({ FLOOR: roomData.FLOOR, ROOM_NUMBER: roomNumber });
            increment++;
          }
        }
        
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
              DATE: new Date(), // Ngày hiện tại khi phòng được tạo
              AVAILABLE: true
            }
          ],
          CUSTOM_ATTRIBUTES: roomData.CUSTOM_ATTRIBUTES,
          DEPOSIT_PERCENTAGE: roomData.DEPOSIT_PERCENTAGE,
          DISCOUNT: roomData.DISCOUNT
        };

        // Thay vì sử dụng insertMany, sử dụng save() từng phòng
        const newRoom = new ROOM_MODEL(newRoomData);
        await newRoom.save(); // Chạy middleware save
        roomsToAdd.push(newRoom);
      }
      
      return roomsToAdd;
    } catch (error) {
      throw new Error('Error adding rooms: ' + error.message);
    }
  }
}

module.exports = new ROOM_SERVICE();
