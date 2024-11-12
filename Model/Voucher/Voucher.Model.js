const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VoucherSchema = new Schema(
  {
    CODE: { type: String, required: true, unique: true }, // Mã voucher
    DISCOUNT_PERCENTAGE: { type: Number, required: true }, // Phần trăm giảm giá
    EXPIRATION_DATE: { type: Date, required: true }, // Ngày hết hạn
    MIN_NIGHTS: { type: Number, default: null }, // Số đêm tối thiểu (tùy chọn)
    MIN_TOTAL_AMOUNT: { type: Number, default: null }, // Giá trị đặt phòng tối thiểu (tùy chọn)
    ROOM_TYPES: [{ type: String, default: [] }], // Các loại phòng áp dụng (tùy chọn)
    APPLICABLE_HOTELS: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }], // Khách sạn áp dụng
    IS_ACTIVE: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Voucher = mongoose.model("Voucher", VoucherSchema);

module.exports = Voucher;
