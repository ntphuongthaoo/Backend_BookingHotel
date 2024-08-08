const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AvailabilitySchema = new Schema({
  DATE: {
    type: Date,
    required: true
  },
  AVAILABLE: {
    type: Boolean,
    required: true
  },
  _id: false // Disable the creation of an _id field for this subdocument
});

const RoomSchema = new Schema({
  HOTEL_ID: { 
    type: Schema.Types.ObjectId, 
    required: true 
  },
  ROOM_NUMBER: { 
    type: String, 
    required: true 
  },
  TYPE: { 
    type: String, 
    enum: ['Single', 'Double', 'Suite'], 
    required: true 
  },
  PRICE_PERNIGHT: { 
    type: String, 
    required: true 
  },
  DESCRIPTION: { 
    type: String 
  },
  IMAGES: [{ 
    type: String 
  }],
  AMENITIES: [{ 
    type: String 
  }],
  AVAILABILITY: [AvailabilitySchema], // Thêm lịch trống vào schema
  
  CUSTOM_ATTRIBUTES: {
    type: Map,
    of: Schema.Types.Mixed
  },
  CREATE_AT: { 
    type: Date, 
    default: Date.now 
  },
  UPDATE_AT: { 
    type: Date, 
    default: Date.now 
  },
  REQUIRES_ONLINE_PAYMENT: { 
    type: Boolean, 
    required: true 
  },
  DEPOSIT_PERCENTAGE: { 
    type: Number, 
    required: true 
  },
  DISCOUNT: { 
    type: Number 
  }
}, { 
  versionKey: false 
});

const Room = mongoose.model("Room", RoomSchema);

module.exports = Room;
