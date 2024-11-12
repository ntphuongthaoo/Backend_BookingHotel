const voucherService = require("../../Service/Voucher/Voucher.Service");
const Voucher = require("../../Model/Voucher/Voucher.Model");

class VoucherController {
  // Tạo voucher mới
  async createVoucher(req, res) {
    try {
      const voucher = await voucherService.createVoucher(req.body);
      res.status(201).json(voucher);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Lấy danh sách tất cả voucher
  async getAllVouchers(req, res) {
    try {
      const vouchers = await voucherService.getAllVouchers();
      res.status(200).json(vouchers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Lấy thông tin chi tiết một voucher
  async getVoucherById(req, res) {
    try {
      const voucher = await voucherService.getVoucherById(req.params.id);
      if (!voucher)
        return res.status(404).json({ error: "Voucher không tồn tại" });
      res.status(200).json(voucher);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Cập nhật voucher
  async updateVoucher(req, res) {
    try {
      const voucher = await voucherService.updateVoucher(
        req.params.id,
        req.body
      );
      if (!voucher)
        return res.status(404).json({ error: "Voucher không tồn tại" });
      res.status(200).json(voucher);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Xóa voucher
  async deleteVoucher(req, res) {
    try {
      const result = await voucherService.deleteVoucher(req.params.id);
      if (!result)
        return res.status(404).json({ error: "Voucher không tồn tại" });
      res.status(200).json({ message: "Voucher đã bị xóa" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Áp dụng voucher cho người dùng
  async applyVoucher(req, res) {
    try {
      const { code, bookingDetails } = req.body;
      const result = await voucherService.applyVoucher(code, bookingDetails);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLatestVouchers(req, res) {
    try {
      const latestVouchers = await Voucher.find({ IS_ACTIVE: true })
        .sort({ createdAt: -1 })
        .limit(3) // Giới hạn lấy 3 voucher mới nhất
        .populate({
          path: "APPLICABLE_HOTELS", // Tên trường cần populate
          select: "NAME", // Chỉ lấy trường NAME của khách sạn
        });

      res.status(200).json(latestVouchers);
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi lấy voucher mới nhất" });
    }
  }

  async getVouchersByHotelId(req, res) {
    const hotelId = req.params.hotelId;

    try {
      const vouchers = await Voucher.find({
        APPLICABLE_HOTELS: hotelId,
        IS_ACTIVE: true, // Lọc các voucher đang hoạt động
      }).populate("APPLICABLE_HOTELS", "NAME"); // Populate để lấy tên khách sạn

      res.status(200).json({ success: true, data: vouchers });
    } catch (error) {
      console.error("Lỗi khi lấy voucher:", error);
      res.status(500).json({ success: false, message: "Lỗi khi lấy voucher" });
    }
  }
}

module.exports = new VoucherController();
