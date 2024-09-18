const HOTEL_MODEL = require("../../Model/Hotel/Hotel.Model");
const HOTEL_SERVICE = require("../../Service/Hotel/Hotel.Service");
const {
  createHotelValidate,
} = require("../../Model/Hotel/validate/validateHotel");

class HOTEL_CONTROLLER {
  async createHotel(req, res) {
    const payload = req.body;
    const { error, value } = createHotelValidate.validate(payload);

    if (error) {
      const errors = error.details.reduce((acc, current) => {
        acc[current.context.key] = current.message;
        return acc;
      }, {});
      return res.status(400).json({ errors });
    }
    try {
      // **Upload ảnh từ request nếu có**
      if (req.files && req.files.length > 0) {
        const images = req.files.map((file) => ({ path: file.path })); // Lấy đường dẫn tạm thời từ Multer
        roomData.IMAGES = images;
      }
      const hotel = await HOTEL_SERVICE.createHotel(payload);
      return res.status(200).json({
        success: true,
        message: "Tạo khách sạn thành công!!",
        data: hotel,
      });
    } catch (err) {
      console.error(err); // Ghi lỗi ra console để kiểm tra
      return res.status(500).json({
        success: false,
        message: "Tạo khách sạn thất bại!!",
        error: err.message, // Trả về thông tin lỗi chi tiết
      });
    }
  }

  async updateHotel(req, res) {
    const { id } = req.params;
    const hotelData = req.body;
    try {
      // **Upload ảnh từ request nếu có**
      if (req.files && req.files.length > 0) {
        const images = req.files.map((file) => ({ path: file.path })); // Lấy đường dẫn tạm thời từ Multer
        roomData.IMAGES = images;
      }
      const updatedHotel = await HOTEL_SERVICE.updateHotelById(id, hotelData);

      if (updatedHotel) {
        return res.status(200).json({
          message: "Khách sạn đã được cập nhật thành công.",
          data: updatedHotel,
        });
      } else {
        return res.status(404).json({ message: "Khách sạn không tìm thấy." });
      }
    } catch (err) {
      return res.status(500).json({ 
        message: "Lỗi khi cập nhật khách sạn!!",
        error: err.message
     });
    }
  }

  async deleteHotel(req, res) {
    try {
      const { hotelId } = req.params;

      if (!hotelId) {
        return res.status(404).json({ message: "HoetleId là bắt buộc." });
      }
      const result = await HOTEL_SERVICE.deleteHotel(hotelId);
      return res.status(200).json({
        message: "Xóa khách sạn thành công!!",
        data: result,
      });
    } catch (err) {
      return res.status(500).json({ message: "Lỗi khi xóa khách sạn!!" });
    }
  }

  async getHotelById(req, res) {
    try {
      const HotelId = req.params.id;
      const Hotel = await HOTEL_SERVICE.getHotelById(HotelId);
      if (!HotelId) {
        return res.status(404).json({ message: "Không tìm thấy khách sạn!" });
      }
      return res.status(200).json({
        success: true,
        data: Hotel,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  async getAllHotels(req, res) {
    try {
      const hotels = await HOTEL_SERVICE.getAllHotels();
      return res.status(200).json({
        success: true,
        data: hotels,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }

  async getHotelsAndSearch(req, res) {
    try {
      const { tabStatus, page = 1, limit = 10, search = "" } = req.query;

      // Lấy userRole từ yêu cầu, ví dụ từ token hoặc từ một nơi nào đó
      const userRole = req.user.ROLE; // Giả sử bạn đã lưu thông tin người dùng vào req.user từ middleware xác thực

      // Gọi dịch vụ để lấy dữ liệu khách sạn
      const result = await HOTEL_SERVICE.getHotelsAndSearch(
        tabStatus,
        parseInt(page, 10),
        parseInt(limit, 10),
        search,
        userRole // Truyền userRole vào phương thức dịch vụ
      );

      return res.status(200).json({
        success: true,
        data: result.hotels,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi truy vấn khách sạn.",
        error: err.message,
      });
    }
  }

  async getServiceInHotel(req, res) {
    try {
      const hotelId = req.params.id;
      const service = await HOTEL_SERVICE.getServiceInHotel(hotelId);

      return res.status(200).json({
        success: true,
        data: service
      });

    }catch (error) {
      console.error("Error booking from cart:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error booking from cart.",
        error: error.message,
      });
    }
  }
}

module.exports = new HOTEL_CONTROLLER();
