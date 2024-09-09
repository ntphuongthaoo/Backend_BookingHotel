const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MetadataHotel = require('../MetadataHotel/MetadataHotel');

const AddressSchema = new Schema({
  PROVINCE: {
    NAME: {
      type: String,
      required: true
    },
    CODE: {
      type: Number,
      required: true
    }
  },
  DISTRICT: {
    NAME: {
      type: String,
      required: true
    },
    CODE: {
      type: Number,
      required: true
    }
  },
  WARD: {
    NAME: {
      type: String,
      required: true
    },
    CODE: {
      type: Number,
      required: true
    }
  },
  _id: false
});

const HotelSchema = new Schema({

  NAME: {
    type: String,
    required: true
  },
  ADDRESS: {
    type: AddressSchema,
    required: true
  },
  STATE: {
    type: Boolean,
    required: true
  },
  PHONE: {
    type: String,
    required: true
  },
  EMAIL: {
    type: String,
    required: true
  },
  DESCRIPTION: {
    type: String
  },
  IS_DELETED: {
    type: Boolean,
    default: false
  },
  IMAGE: {
    type: [String], // Lưu URL hoặc đường dẫn hình ảnh
  },
}, { 
  versionKey: false,
  timestamps: true // Tự động thêm createdAt và updatedAt
});

// Middleware sau khi lưu tài liệu để tạo MetadataHotel
HotelSchema.post('save', async function(doc, next) {
  try {
    const newMetadata = new MetadataHotel({
      HOTEL_ID: doc._id,
      TOTAL_ROOMS: 0, // Tổng số phòng
      TOTAL_ROOM_SINGLES: 0, // Tổng số phòng đơn
      TOTAL_ROOM_DOUBLES: 0, // Tổng số phòng đôi
      TOTAL_ROOM_SUITES: 0, // Tổng số phòng suite
      AVAILABLE_ROOMS: 0, // Tổng số phòng có sẵn
      BOOKED_ROOMS_SINGLES: 0, // Số phòng đơn đã đặt
      BOOKED_ROOMS_DOUBLES: 0, // Số phòng đôi đã đặt
      BOOKED_ROOMS_SUITES: 0, // Số phòng suite đã đặt
      NUMBER_OF_EMPLOYEES: 0 // Số lượng nhân viên
    });
    await newMetadata.save();
    next();
  } catch (error) {
    next(error);
  }
});


const Hotel = mongoose.model("Hotel", HotelSchema);

module.exports = Hotel;
