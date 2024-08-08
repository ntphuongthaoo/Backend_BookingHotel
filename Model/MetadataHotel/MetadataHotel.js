const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MetadataHotelSchema = new Schema({
  HOTEL_ID: {
    type: Schema.Types.ObjectId,
    required: true
  },
  TOTAL_ROOMS: {
    type: Number,
    required: true
  },
  AVAILABLE_ROOMS: {
    type: Number,
    required: true
  },
  BOOKED_ROOMS: {
    type: Number,
    required: true
  },
  NUMBER_OF_EMPLOYEES: {
    type: Number,
    required: true
  }
}, {
  versionKey: false
});

const MetadataHotel = mongoose.model('MetadataHotel', MetadataHotelSchema);

module.exports = MetadataHotel;
