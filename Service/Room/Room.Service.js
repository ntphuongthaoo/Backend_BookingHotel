const ROOM_MODEL = require("../../Model/Room/Room.Model")

class ROOM_SERVICE {
    async createRoom (roomData){
        const newRoom = new ROOM_MODEL({
            HOTEL_ID: roomData.HOTEL_ID,
            ROOM_NUMBER: roomData.ROOM_NUMBER,
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
            DISCOUNT: roomData.DISCOUNT,
          });
      
        const savedRoom = await newRoom.save();
        return savedRoom.toObject();
    }

}
module.exports = new ROOM_SERVICE();