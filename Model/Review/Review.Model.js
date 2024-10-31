const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
