const REVIEW_SERVICE = require("../../Service/Review/Review.Service");
const ROOM_MODEL = require("../../Model/Room/Room.Model");
const REVIEW_MODEL = require("../../Model/Review/Review.Model");

class REVIEW_CONTROLLER {
  async addReview(req, res) {
    try {
      const { bookingId, roomId, rating, comment } = req.body;
      const userId = req.user._id; // Lấy userId từ token (req.user)

      // Gọi hàm addReview từ service
      const review = await REVIEW_SERVICE.addReview(
        userId,
        bookingId,
        roomId,
        rating,
        comment
      );

      return res.json({ success: true, msg: "Đánh giá thành công", review });
    } catch (error) {
      console.error("Lỗi khi thêm đánh giá:", error);
      return res.status(400).json({ success: false, msg: error.message });
    }
  }

  async getReviewsByRoomId(req, res) {
    try {
      const { roomId } = req.params;
      const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

      const reviews = await REVIEW_SERVICE.getReviewsByRoomId(
        roomId,
        page,
        limit,
        sort
      );

      if (!reviews || reviews.length === 0) {
        return res.status(404).json({
          success: false,
          msg: "Không có đánh giá nào cho phòng này.",
        });
      }

      return res.json({ success: true, reviews });
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error);
      return res.status(500).json({ success: false, msg: error.message });
    }
  }

  async getReviewByUserAndRoom(req, res) {
    try {
      const userId = req.user_id;
      const { roomId, bookingId } = req.body;

      const review = await REVIEW_SERVICE.getReviewByUserAndRoom(
        userId,
        roomId,
        bookingId
      );

      if (!review) {
        return res
          .status(404)
          .json({ success: false, msg: "Người dùng chưa đánh giá phòng này." });
      }

      return res.json({ success: true, review });
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error);
      return res.status(500).json({ success: false, msg: error.message });
    }
  }

  async updateReview(req, res) {
    try {
      const userId = req.user._id; // Lấy userId từ req.user
      const { reviewId } = req.params;
      const { rating, comment } = req.body;

      // Gọi service để cập nhật đánh giá
      const updatedReview = await REVIEW_SERVICE.updateReview(
        reviewId,
        userId,
        rating,
        comment
      );

      return res.status(200).json({
        success: true,
        message: "Cập nhật đánh giá thành công",
        data: updatedReview,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getRoomReviewStats(req, res) {
    try {
      const { roomId } = req.params;
      const stats = await REVIEW_SERVICE.getRoomReviewStats(roomId);

      return res.json({ success: true, stats });
    } catch (error) {
      console.error("Lỗi khi lấy thống kê đánh giá:", error);
      return res.status(500).json({ success: false, msg: error.message });
    }
  }

  async deleteReviewByUser(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user._id; // Lấy userId từ token (req.user)

      const deletedReview = await REVIEW_SERVICE.deleteReviewPermanently(
        reviewId,
        userId
      );

      return res.json({
        success: true,
        msg: "Xóa đánh giá thành công",
        review: deletedReview,
      });
    } catch (error) {
      console.error("Lỗi khi xóa đánh giá:", error);
      return res.status(400).json({ success: false, msg: error.message });
    }
  }

  async toggleReviewStatus(req, res) {
    try {
      const { reviewId } = req.params;
      const { status } = req.body; // Nhận trạng thái từ body (true hoặc false)

      const updatedReview = await REVIEW_SERVICE.toggleReviewStatus(
        reviewId,
        status
      );

      return res.json({
        success: true,
        msg: status
          ? "Hiển thị lại đánh giá thành công"
          : "Ẩn đánh giá thành công",
        review: updatedReview,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đánh giá:", error);
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
  async getReviews(req, res) {
    try {
      const { hotelId, roomId, rating, status } = req.query;
      const filter = {};
  
      // Nếu có hotelId, lấy tất cả các phòng thuộc khách sạn đó
      if (hotelId) {
        const rooms = await ROOM_MODEL.find({ HOTEL_ID: hotelId }).select("_id TYPE");
        // Nếu lọc theo loại phòng, sử dụng roomId để lấy ra các roomIds tương ứng
        if (roomId) {
          const filteredRooms = rooms.filter(room => room.TYPE === roomId);
          filter.ROOM_ID = { $in: filteredRooms.map(room => room._id) };
        } else {
          filter.ROOM_ID = { $in: rooms.map(room => room._id) }; // Lấy tất cả phòng
        }
      }
  
      // Lọc theo số sao (rating)
      if (rating) {
        filter.RATING = Number(rating);
      }
  
      // Lọc theo trạng thái (hiển thị/ẩn)
      if (status !== undefined) {
        filter.STATUS = status === "true";
      }
  
      const reviews = await REVIEW_MODEL.find(filter)
        .populate("USER_ID", "FULLNAME")
        .populate("ROOM_ID", "ROOM_NUMBER TYPE CUSTOM_ATTRIBUTES")
        .sort("-createdAt");
  
      return res.json({ success: true, reviews });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đánh giá:", error);
      return res.status(500).json({ success: false, msg: error.message });
    }
  }  
}

module.exports = new REVIEW_CONTROLLER();
