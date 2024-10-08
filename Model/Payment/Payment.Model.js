const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({

  BOOKING_ID: {
    type: Schema.Types.ObjectId,
    required: true
  },
  USER_ID: {
    type: Schema.Types.ObjectId,
    required: true
  },
  PAYMENT_METHOD: {
    type: String,
    enum: ['Credit Card', 'PayPal', 'ZaloPay'],
    required: true
  },
  STATUS: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed'],
    required: true
  },
  AMOUNT: {
    type: Number,
    required: true
  },
  PAID: {
    type: Number,
    required: true
  },
  DISCOUNT: {
    type: Number,
    required: false
  },
  CREATE_AT: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
