const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  booking_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  USER_ID: {
    type: Schema.Types.ObjectId,
    required: true
  },
  ROOM_ID: {
    type: Schema.Types.ObjectId,
    required: true
  },
  CHECKIN_DATE: {
    type: Date,
    required: true
  },
  CHECKOUT_DATE: {
    type: Date,
    required: true
  },
  TOTAL_PRICE: {
    type: Number,
    required: true
  },
  STATUS: {
    type: String,
    enum: ['Booked', 'Canceled', 'Completed'],
    required: true
  },
  BOOKING_TYPE: {
    type: String,
    enum: ['Calling', 'Email', 'Website', 'Live']
  },
  CREATE_AT: {
    type: Date,
    default: Date.now,
    required: true
  },
  UPDATE_AT: {
    type: Date
  }
}, {
  versionKey: false
});

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;
