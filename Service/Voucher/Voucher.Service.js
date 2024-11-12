const Voucher = require("../../Model/Voucher/Voucher.Model");

class VoucherService {
  // Tạo mới một voucher (dành cho admin)
  async createVoucher(data) {
    const newVoucher = new Voucher(data);
    return await newVoucher.save();
  }

  // Lấy danh sách tất cả các voucher (dành cho admin)
  async getAllVouchers() {
    return await Voucher.find({}).populate({
      path: "APPLICABLE_HOTELS",
      select: "NAME", 
    });
  }

  // Lấy thông tin chi tiết một voucher (dành cho admin)
  async getVoucherById(id) {
    return await Voucher.findById(id);
  }

  // Cập nhật voucher (dành cho admin)
  async updateVoucher(id, data) {
    return await Voucher.findByIdAndUpdate(id, data, { new: true });
  }

  // Xóa voucher (dành cho admin)
  async deleteVoucher(id) {
    return await Voucher.findByIdAndDelete(id);
  }

  // Áp dụng voucher cho người dùng khi đặt phòng
  async applyVoucher(code, bookingDetails) {
    const voucher = await Voucher.findOne({ CODE: code, IS_ACTIVE: true });

    // Kiểm tra các điều kiện áp dụng
    if (!voucher)
      throw new Error("Voucher không tồn tại hoặc không còn hiệu lực.");
    if (voucher.EXPIRATION_DATE < new Date())
      throw new Error("Voucher đã hết hạn.");
    if (voucher.MIN_NIGHTS && bookingDetails.nights < voucher.MIN_NIGHTS)
      throw new Error("Không đạt số đêm tối thiểu.");
    if (
      voucher.MIN_TOTAL_AMOUNT &&
      bookingDetails.totalPrice < voucher.MIN_TOTAL_AMOUNT
    )
      throw new Error("Không đạt giá trị tối thiểu.");
    if (
      voucher.ROOM_TYPES.length > 0 &&
      !voucher.ROOM_TYPES.includes(bookingDetails.roomType)
    )
      throw new Error("Voucher không áp dụng cho loại phòng này.");
    if (
      voucher.APPLICABLE_HOTELS.length > 0 &&
      !voucher.APPLICABLE_HOTELS.includes(bookingDetails.hotelId)
    )
      throw new Error("Voucher không áp dụng cho khách sạn này.");

    // Tính giảm giá nếu tất cả điều kiện được đáp ứng
    const discountAmount =
      (bookingDetails.totalPrice * voucher.DISCOUNT_PERCENTAGE) / 100;
    return { discountAmount };
  }
}

module.exports = new VoucherService();
