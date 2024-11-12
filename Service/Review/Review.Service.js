const REVIEW_MODEL = require("../../Model/Review/Review.Model");
const BOOKING_MODEL = require("../../Model/Booking/Booking.Model");

class REVIEW_SERVICE {
  async addReview(userId, bookingId, roomId, rating, comment) {
    // Kiểm tra xem booking có tồn tại với userId không
    const booking = await BOOKING_MODEL.findOne({
      _id: bookingId,
      USER_ID: userId,
    });
    if (!booking) {
      throw new Error("Không tìm thấy đơn đặt phòng");
    }

    // Kiểm tra phòng có trong đơn đặt phòng không
    const roomInBooking = booking.LIST_ROOMS.find(
      (room) => room.ROOM_ID.toString() === roomId
    );
    if (!roomInBooking) {
      throw new Error("Phòng không tồn tại trong đơn đặt");
    }

    // Kiểm tra xem đã có đánh giá cho phòng này chưa
    const existingReview = await REVIEW_MODEL.findOne({
      BOOKING_ID: bookingId,
      ROOM_ID: roomId,
      USER_ID: userId,
    });
    if (existingReview) {
      throw new Error("Bạn đã đánh giá phòng này rồi");
    }

    // Tạo và lưu đánh giá mới
    const newReview = new REVIEW_MODEL({
      USER_ID: userId,
      BOOKING_ID: bookingId,
      ROOM_ID: roomId,
      RATING: rating,
      COMMENT: comment,
      STATUS: true, // Đánh giá được kích hoạt
    });

    await newReview.save();

    return newReview;
  }

  async getReviewsByRoomId(roomId, page = 1, limit = 10, sort = "-createdAt") {
    const reviews = await REVIEW_MODEL.find({ ROOM_ID: roomId })
      .populate({ path: "USER_ID", select: "FULLNAME" })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return reviews;
  }

  async updateReview(reviewId, userId, rating, comment) {
    const review = await REVIEW_MODEL.findOneAndUpdate(
      { _id: reviewId, USER_ID: userId },
      { RATING: rating, COMMENT: comment },
      { new: true } // Trả về đối tượng mới nhất sau khi cập nhật
    ).populate({
      path: 'USER_ID',
      select: 'FULLNAME _id' // Chọn các trường cần thiết từ USER_ID
    });
  
    if (!review) {
      throw new Error(
        "Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa."
      );
    }
  
    return review;
  }
  

  async getReviewByUserAndRoom(userId, roomId, bookingId) {
    const review = await REVIEW_MODEL.findOne({
      USER_ID: userId,
      ROOM_ID: roomId,
      BOOKING_ID: bookingId,
    });
    return review;
  }

  async getRoomReviewStats(roomId) {
    const stats = await REVIEW_MODEL.aggregate([
      { $match: { ROOM_ID: mongoose.Types.ObjectId(roomId) } },
      {
        $group: {
          _id: "$ROOM_ID",
          averageRating: { $avg: "$RATING" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    return stats[0] || { averageRating: 0, totalReviews: 0 };
  }

  async deleteReviewPermanently(reviewId, userId) {
    const review = await REVIEW_MODEL.findOneAndDelete({
      _id: reviewId,
      USER_ID: userId,
    });

    if (!review) {
      throw new Error("Không tìm thấy đánh giá hoặc bạn không có quyền xóa.");
    }

    return review;
  }

  async toggleReviewStatus(reviewId, status) {
    const review = await REVIEW_MODEL.findByIdAndUpdate(
      reviewId,
      { STATUS: status },
      { new: true }
    );

    if (!review) {
      throw new Error("Không tìm thấy đánh giá để cập nhật trạng thái.");
    }

    return review;
  }
}

module.exports = new REVIEW_SERVICE();
