const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartSchema = new Schema(
  {
    USER_ID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User", // Tham chiếu đến collection User
    },
    ROOMS: [
      {
        _id: false,
        ROOM_ID: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Room",
        },
        START_DATE: {
          type: Date,
          required: true,
        },
        END_DATE: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;
