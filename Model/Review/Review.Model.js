const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Hotel = require('../../Model/Hotel/Hotel.Model')
const Room = require('../../Model/Room/Room.Model');

const ReviewSchema = new Schema({

  USER_ID: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  BOOKING_ID: {
    type: Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
  ROOM_ID: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true
  },
  RATING: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  COMMENT: {
    type: String
  },
  STATUS: {
    type: Boolean,
    required: true
  }
}, {
  versionKey: false,
  timestamps: true
});

ReviewSchema.post('save', async function(doc, next) {
  try {
    // Lấy thông tin khách sạn từ ROOM_ID của đánh giá
    const room = await Room.findById(doc.ROOM_ID).lean();
    if (!room) return next(new Error('Room not found'));

    const hotelId = room.HOTEL_ID;

    // Tìm tất cả các đánh giá của các phòng thuộc khách sạn đó và có `STATUS = true`
    const allHotelRoomReviews = await mongoose.model('Review').find({
      ROOM_ID: { $in: await Room.find({ HOTEL_ID: hotelId }).select('_id') },
      STATUS: true
    });

    // Tính rating trung bình của khách sạn
    const averageRating = allHotelRoomReviews.reduce((acc, review) => acc + review.RATING, 0) / allHotelRoomReviews.length;

    // Cập nhật rating trung bình vào model Hotel
    await Hotel.findByIdAndUpdate(hotelId, { rating: averageRating });

    next();
  } catch (error) {
    next(error);
  }
});


const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
