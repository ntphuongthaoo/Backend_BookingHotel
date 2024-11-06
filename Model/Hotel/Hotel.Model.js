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
    required: false // Bắt buộc nhập xã/phường
  },
  DISTRICT: { // Huyện/Quận
    type: String,
    required: false // Bắt buộc nhập huyện/quận
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
  RATING: {
    type: Number,
    default: 0
  },
  SERVICES: {
    PHONG_TAM: {
      name: { type: String, default: "Phòng tắm" },
      GIAY_VE_SINH: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Giấy vệ sinh" } },
      BON_TAM_HOAC_VOI_SEN: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Bồn tắm hoặc vòi sen" } },
      DEP: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Dép" } },
      NHA_VE_SINH: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Nhà vệ sinh" } },
      DO_VE_SINH_CA_NHAN: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Đồ vệ sinh cá nhân" } },
      AO_CHOANG_TAM: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Áo choàng tắm" } },
      BON_TAM: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Bồn tắm" } },
      VOI_SEN: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Vòi sen" } },
    },
    CHO_DAU_XE: {
      name: { type: String, default: "Chỗ đậu xe" },
      CO_CHO_DO_XE_CONG_CONG: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Có chỗ đỗ xe công cộng" } },
    },
    AN_NINH: {
      name: { type: String, default: "An ninh" },
      BAO_DONG_AN_NINH: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Báo động an ninh" } },
      KET_AN_TOAN: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Két an toàn" } },
    },
    CHAM_SOC_SUC_KHOE: {
      enabled: { type: Boolean, default: true },
      name: { type: String, default: "Chăm sóc sức khỏe" },
    },
    DICH_VU_DOANH_NHAN: {
      name: { type: String, default: "Dịch vụ doanh nhân" },
      PHOTOCOPY: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Photocopy" } },
      TRUNG_TAM_DICH_VU_DOANH_NHAN: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Trung tâm dịch vụ doanh nhân" } },
      TIEN_NGHI_HOP_TIEC: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Tiện nghi họp/tiệc" } },
    },
    DICH_VU_GIAT_UI: {
      name: { type: String, default: "Dịch vụ giặt ủi" },
      DON_PHONG_HANG_NGAY: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Dọn phòng hàng ngày" } },
      DICH_VU_LA_UI: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Dịch vụ là/ủi" } },
      GIAT_UI: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Giặt ủi" } },
      GIAT_KHO: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Giặt khô" } },
    },
    DICH_VU_LE_TAN: {
      name: { type: String, default: "Dịch vụ lễ tân" },
      NHAN_TRA_PHONG_RIENG: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Nhận/trả phòng riêng" } },
      GIU_HANH_LY: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Giữ hành lý" } },
      LE_TAN_24H: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Lễ tân 24 giờ" } },
      THU_DOI_NGOAI_TE: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Thu đổi ngoại tệ" } },
    },
    INTERNET: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Internet" } },
    TIEN_ICH_TRONG_PHONG: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Tiện ích trong phòng" } },
    DICH_VU_AN_UONG: { enabled: { type: Boolean, default: true }, name: { type: String, default: "Dịch vụ ăn uống" } },
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
