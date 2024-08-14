const HOTEL_MODEL = require('../../Model/Hotel/Hotel.Model')

class HOTEL_SERVICE {
    async createHotel (data) {
        const newHotel = new HOTEL_MODEL(data);
        const result = await newHotel.save();
        return result.toObject();
    }

    async updateHotelById (id, hotelData) {
        const updateHotel = await HOTEL_MODEL.findByIdAndUpdate(
            id, 
            {
                ...hotelData,
                UPDATE_AT: new Date()
            },
            {new: true}
        );
        return updateHotel;
    }
}

module.exports = new HOTEL_SERVICE();