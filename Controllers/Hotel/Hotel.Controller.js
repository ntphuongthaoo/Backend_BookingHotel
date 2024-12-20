const HOTEL_MODEL = require("../../Model/Hotel/Hotel.Model");
const HOTEL_SERVICE = require("../../Service/Hotel/Hotel.Service");
const CLOUDINARY = require("../../Config/cloudinaryConfig");

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
      let uploadedImages = [];
  
      // **Upload ảnh từ file (nếu có)**
      if (req.files && req.files.length > 0) {
        uploadedImages = await Promise.all(
          req.files.map(async (file) => {
            const uploadResult = await CLOUDINARY.uploader.upload(file.path); // Upload lên Cloudinary
            return uploadResult.secure_url; // Trả về URL ảnh đã upload
          })
        );
      }
  
      // **Upload ảnh từ URL (nếu có)**
      if (payload.IMAGES && payload.IMAGES.length > 0) {
        const urlUploads = await Promise.all(
          payload.IMAGES.map(async (imageUrl) => {
            if (imageUrl.startsWith('http')) {
              const uploadResult = await CLOUDINARY.uploader.upload(imageUrl); // Upload từ URL
              return uploadResult.secure_url;
            }
          })
        );
        uploadedImages = uploadedImages.concat(urlUploads); // Kết hợp cả ảnh từ file và URL
      }
  
      // Gán ảnh đã upload vào payload
      payload.IMAGES = uploadedImages;
  
      const hotel = await HOTEL_SERVICE.createHotel(payload);
      return res.status(200).json({
        success: true,
        message: "Tạo khách sạn thành công!",
        data: hotel,
      });
    } catch (err) {
      console.error(err); // Ghi lỗi ra console để kiểm tra
      return res.status(500).json({
        success: false,
        message: "Tạo khách sạn thất bại!",
        error: err.message, // Trả về thông tin lỗi chi tiết
      });
    }
  }    

  async updateHotel(req, res) {
    const hotelId = req.params.id;
    const payload = req.body;
  
    try {
      let uploadedImages = [];
  
      // **Upload ảnh từ file (nếu có)**
      if (req.files && req.files.length > 0) {
        uploadedImages = await Promise.all(
          req.files.map(async (file) => {
            const uploadResult = await CLOUDINARY.uploader.upload(file.path); // Upload lên Cloudinary
            return uploadResult.secure_url; // Trả về URL ảnh đã upload
          })
        );
      }
  
      // **Upload ảnh từ URL (nếu có)**
      if (payload.IMAGES && payload.IMAGES.length > 0) {
        const urlUploads = await Promise.all(
          payload.IMAGES.map(async (imageUrl) => {
            if (imageUrl.startsWith('http')) {
              const uploadResult = await CLOUDINARY.uploader.upload(imageUrl); // Upload từ URL
              return uploadResult.secure_url;
            }
          })
        );
        uploadedImages = uploadedImages.concat(urlUploads); // Kết hợp cả ảnh từ file và URL
      }
  
      // Gán ảnh đã upload vào payload
      payload.IMAGES = uploadedImages;
  
      // Gọi service để cập nhật khách sạn
      const updatedHotel = await HOTEL_SERVICE.updateHotelById(hotelId, payload);
  
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
        message: "Lỗi khi cập nhật khách sạn!",
        error: err.message,
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
        data: service,
      });
    } catch (error) {
      console.error("Error booking from cart:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error booking from cart.",
        error: error.message,
      });
    }
  }

  async getHotelsName(req, res) {
    try {
      const name = await HOTEL_SERVICE.getHotelsName();
      return res.status(200).json({
        success: true,
        data: name,
      });
    } catch (error) {
      console.error("Error booking from cart:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error booking from cart.",
        error: error.message,
      });
    }
  }

  async toggleServiceGroup(req, res) {
    const { hotelId, serviceGroup, status } = req.body;

    try {
      const updatedHotel = await HOTEL_SERVICE.toggleAllServicesInGroup(
        hotelId,
        serviceGroup,
        status
      );

      return res.status(200).json({
        success: true,
        message: `Tất cả dịch vụ trong nhóm ${serviceGroup} đã được cập nhật thành ${status}`,
        data: updatedHotel,
      });
    } catch (error) {
      console.error("Error in toggleServiceGroup:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi cập nhật dịch vụ",
        error: error.message,
      });
    }
  }

  async updateAllServiceFields(req, res) {
    const { hotelId, SERVICES } = req.body;
    
    try {
      const updatedHotel = await HOTEL_SERVICE.updateAllServiceFields(hotelId, SERVICES);
      return res.status(200).json({
        success: true,
        message: "All services have been updated to true.",
        data: updatedHotel
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error updating all service fields",
        error: error.message
      });
    }
  }

  async updateHotelRating(req, res) {
    try {
      const hotelId = req.params.hotelId;
  
      // Tính rating trung bình cho khách sạn
      const averageRating = await HOTEL_SERVICE.calculateAverageRatingForHotel(hotelId);
  
      // Cập nhật rating trung bình vào khách sạn
      await HOTEL_MODEL.findByIdAndUpdate(hotelId, { RATING: averageRating });
  
      res.status(200).json({
        success: true,
        message: 'Hotel rating updated successfully',
        rating: averageRating
      });
    } catch (error) {
      console.error('Error updating hotel rating:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update hotel rating'
      });
    }
  }

  async getTopBookedHotels( req, res) {
    try {
      const topBookedHotels = await HOTEL_SERVICE.getTopBookedHotels();
      res.json({ success: true, data: topBookedHotels });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khách sạn được đặt nhiều nhất:", error);
      res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi lấy dữ liệu." });
    }
  }
  
}

module.exports = new HOTEL_CONTROLLER();
