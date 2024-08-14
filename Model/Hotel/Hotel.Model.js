const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
  PROVINCE: {
    NAME: {
      type: String,
      required: true
    },
    CODE: {
      type: Number,
      required: true
    }
  },
  DISTRICT: {
    NAME: {
      type: String,
      required: true
    },
    CODE: {
      type: Number,
      required: true
    }
  },
  WARD: {
    NAME: {
      type: String,
      required: true
    },
    CODE: {
      type: Number,
      required: true
    }
  },
  DESCRIPTION: {
    type: String
  },
  _id: false
});

const HotelSchema = new Schema({

  NAME: {
    type: String,
    required: true
  },
  ADDRESS: {
    type: AddressSchema,
    required: true
  },
  STATE: {
    type: Boolean,
    required: true
  },
  PHONE: {
    type: String,
    required: true
  },
  EMAIL: {
    type: String,
    required: true
  },
  CREATE_AT: {
    type: Date,
    default: Date.now
  },
  UPDATE_AT: {
    type: Date,
    default: Date.now
  }
}, { 
  versionKey: false 
});

// Middleware trước khi lưu tài liệu
HotelSchema.pre('save', function (next) {
  const now = new Date();
  this.UPDATE_AT = now;
  if (!this.CREATE_AT) {
    this.CREATE_AT = now;
  }
  next();
});

const Hotel = mongoose.model("Hotel", HotelSchema);

module.exports = Hotel;
