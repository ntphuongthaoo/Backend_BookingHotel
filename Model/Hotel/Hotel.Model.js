const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MetadataHotel = require('../MetadataHotel/MetadataHotel');

const AddressSchema = new Schema({
  ADDRESS_LINE: { // Gộp số nhà và tên đường vào một trường
    type: String,
    required: false // Để trống nếu không có thông tin
  },
  HAMLET: { // Dành cho những địa chỉ ở khu vực không có số nhà/đường
    type: String,
    required: false // Để trống nếu không cần thiết
  },
  WARD: { // Xã/Phường
    type: String,
    required: true // Bắt buộc nhập xã/phường
  },
  DISTRICT: { // Huyện/Quận
    type: String,
    required: true // Bắt buộc nhập huyện/quận
  },
  CITY: { // Tỉnh/Thành phố
    type: String,
    required: true // Bắt buộc nhập tỉnh/thành phố
  },
  COUNTRY: { // Quốc gia, mặc định là Việt Nam
    type: String,
    default: 'Vietnam',
    required: true
  },
  _id: false // Không cần tạo _id cho subdocument này
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
  IMAGES: {
    type: [String], // Lưu URL hoặc đường dẫn hình ảnh
  },
  SERVICES: {
    PHONG_TAM: {
      GIAY_VE_SINH: { type: Boolean, default: false },
      BON_TAM_HOAC_VOI_SEN: { type: Boolean, default: false },
      DEP: { type: Boolean, default: false },
      NHA_VE_SINH: { type: Boolean, default: false },
      DO_VE_SINH_CA_NHAN: { type: Boolean, default: false },
      AO_CHOANG_TAM: { type: Boolean, default: false },
      BON_TAM: { type: Boolean, default: false },
      VOI_SEN: { type: Boolean, default: false },
    },
    CHO_DAU_XE: {
      CO_CHO_DO_XE_CONG_CONG: { type: Boolean, default: false },
    },
    AN_NINH: {
      BAO_DONG_AN_NINH: { type: Boolean, default: false },
      KET_AN_TOAN: { type: Boolean, default: false },
    },
    CHAM_SOC_SUC_KHOE: {
      type: Boolean,
      default: false,
    },
    DICH_VU_DOANH_NHAN: {
      PHOTOCOPY: { type: Boolean, default: false },
      TRUNG_TAM_DICH_VU_DOANH_NHAN: { type: Boolean, default: false },
      TIEN_NGHI_HOP_TIEC: { type: Boolean, default: false },
    },
    DICH_VU_GIAT_UI: {
      DON_PHONG_HANG_NGAY: { type: Boolean, default: false },
      DICH_VU_LA_UI: { type: Boolean, default: false },
      GIAT_UI: { type: Boolean, default: false },
      GIAT_KHO: { type: Boolean, default: false },
    },
    DICH_VU_LE_TAN: {
      NHAN_TRA_PHONG_RIENG: { type: Boolean, default: false },
      GIU_HANH_LY: { type: Boolean, default: false },
      LE_TAN_24H: { type: Boolean, default: false },
      THU_DOI_NGOAI_TE: { type: Boolean, default: false },
    },
    INTERNET: { type: Boolean, default: false },
    TIEN_ICH_TRONG_PHONG: { type: Boolean, default: false },
    DICH_VU_AN_UONG: { type: Boolean, default: false },
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
