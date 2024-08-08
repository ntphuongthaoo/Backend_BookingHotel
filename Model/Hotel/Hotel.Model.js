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
    type: String,
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
    required: true
  },
  UPDATE_AT: {
    type: Date,
    required: true
  }
}, { 
  versionKey: false 
});

const Hotel = mongoose.model("Hotel", HotelSchema);

module.exports = Hotel;
