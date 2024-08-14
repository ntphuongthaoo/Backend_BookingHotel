const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({

  USER_ID: {
    type: Schema.Types.ObjectId,
    required: true
  },
  ROOMS: [{
    ROOM_ID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Room'
    },
    START_DATE: {
      type: Date,
      required: true
    },
    END_DATE: {
      type: Date,
      required: true
    }
  }],
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
    enum: ['Booked', 'CheckedIn', 'Canceled', 'CheckedOut'],
    required: true
  },
  BOOKING_TYPE: {
    type: String,
    enum: ['Calling', 'Email', 'Website', 'Live']
  },
  CUSTOMER_PHONE: {
    type: String,
    required: true
  },
  CUSTOMER_NAME: {
    type: String,
    required: true
  },
  CITIZEN_ID: {
    type: String,
    required: true
  },
  START_DATE: {
    type: Date,
    required: true
  },
  END_DATE: {
    type: Date,
    required: true
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
