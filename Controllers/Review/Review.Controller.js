const REVIEW_SERVICE = require("../../Service/Review/Review.Service");

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
        return res
          .status(404)
          .json({
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
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user._id; // Lấy từ token xác thực

      const updatedReview = await REVIEW_SERVICE.updateReview(
        reviewId,
        userId,
        rating,
        comment
      );

      return res.json({
        success: true,
        msg: "Chỉnh sửa đánh giá thành công",
        review: updatedReview,
      });
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa đánh giá:", error);
      return res.status(400).json({ success: false, msg: error.message });
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
 
}

module.exports = new REVIEW_CONTROLLER();
