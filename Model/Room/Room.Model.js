const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MetadataRoom = require("../MetadataRoom/MetadataRoom");
const ROOM_SERVICE = require('../../Service/Room/Room.Service');

const AvailabilitySchema = new Schema({
  DATE: {
    type: Date,
    required: true,
  },
  AVAILABLE: {
    type: Boolean,
    required: true,
  },
  _id: false, // Disable the creation of an _id field for this subdocument
});

const RoomSchema = new Schema(
  {
    HOTEL_ID: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    ROOM_NUMBER: {
      type: String,
      required: true,
    },
    FLOOR: {
      type: Number,
      required: true,
    },
    TYPE: {
      type: String,
      enum: ["Superior", "Deluxe", "Suite"],
      required: true,
    },
    PRICE_PERNIGHT: {
      type: Number,
      required: true,
    },
    DESCRIPTION: {
      type: String,
    },
    IMAGES: {
      type: [String],
    },

    AVAILABILITY: [AvailabilitySchema], // Thêm lịch trống vào schema

    CUSTOM_ATTRIBUTES: {
      bedType: {
        type: String,
      },
      view: {
        type: String,
      },
      amenities: {
        type: String,
      },
      area: {
        type: String,
      },
      others: {
        type: Map,
        of: Schema.Types.Mixed,
      },
    },
    IS_DELETED: {
      type: Boolean,
      default: false,
    },
    IS_IN_CART: {
      type: Boolean,
      default: false,
    }
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

RoomSchema.pre("save", async function (next) {
  if (this.isNew && this.FLOOR != null && (!this.ROOM_NUMBER || this.ROOM_NUMBER === "")) {
    try {
      this.ROOM_NUMBER = await ROOM_SERVICE.generateRoomNumber(this.FLOOR, this.HOTEL_ID);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});


RoomSchema.post("save", async function (doc, next) {
  try {
    const newMetadataRoom = new MetadataRoom({
      ROOM_ID: doc._id,
      TOTAL_BOOKINGS: 0,
      TOTAL_REVIEWS: 0,
      AVERAGE_RATING: 0,
      PENDING_BOOKINGS: 0,
    });

    await newMetadataRoom.save();
    next();
  } catch (error) {
    next(error);
  }
});

const Room = mongoose.model("Room", RoomSchema);

module.exports = Room;
