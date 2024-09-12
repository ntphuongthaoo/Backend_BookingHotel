const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
  USER_ID: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Tham chiếu đến collection User
  },
  LIST_ROOMS: [{
    HOTEL_ID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Hotel'
    },
    ROOMS: [{
      _id: false,
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
      },
      TOTAL_PRICE_FOR_ROOM: {
        type: Number,
        default: 0
      },
    }],
  }],
  LIST_ROOM_MAX_NUMBER: {
    type: Number,
    required: true
  },
}, {
  versionKey: false,
  timestamps: true,
});

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
