const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MetadataRoom = require("../MetadataRoom/MetadataRoom");

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

const ImageSchema = new Schema(
  {
    path: {
      type: String,
      required: true, // Đường dẫn tới file ảnh trên máy chủ hoặc URL
    },
    description: {
      type: String,
    },
    order: {
      type: Number,
    },
  },
  { _id: false }
);

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
      enum: ["Single", "Double", "Suite"],
      required: true,
    },
    PRICE_PERNIGHT: {
      type: Number,
      required: true,
    },
    DESCRIPTION: {
      type: String,
    },
    IMAGES: [ImageSchema],

    AVAILABILITY: [AvailabilitySchema], // Thêm lịch trống vào schema

    CUSTOM_ATTRIBUTES: {
      bedType: {
        type: String,
      },
      view: {
        type: String,
      },
      others: {
        type: Map,
        of: Schema.Types.Mixed,
      },
    },
    DEPOSIT_PERCENTAGE: {
      type: Number,
      required: true,
    },
    IS_DELETED: {
      type: Boolean,
      default: false
    }
    // DISCOUNT: {
    //   type: Number,
    // },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

RoomSchema.pre("save", async function (next) {
  if (this.isNew && this.FLOOR != null && this.ROOM_NUMBER != null) {
    try {
      // Đảm bảo ROOM_NUMBER là 2 chữ số bằng cách thêm số 0 phía trước nếu cần
      const roomNumberSuffix = this.ROOM_NUMBER.toString().padStart(2, "0");
      const floorPrefix = this.FLOOR.toString();

      // Ghép FLOOR và ROOM_NUMBER thành ROOM_NUMBER đầy đủ
      this.ROOM_NUMBER = `${floorPrefix}${roomNumberSuffix}`;
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
