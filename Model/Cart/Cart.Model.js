const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
  USER_ID: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Tham chiếu đến collection User
  },
  LIST_ROOM_REF: [{
    ROOM_ID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Room' // Tham chiếu đến collection Room
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
  LIST_ROOM_MAX_NUMBER: {
    type: Number,
    required: true
  },
  CREATE_AT: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  versionKey: false
});

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
