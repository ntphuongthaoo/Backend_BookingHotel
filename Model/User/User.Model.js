const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  FULLNAME: { 
    type: String, 
    required: true 
  },
  HOTEL_ID: { 
    type: Schema.Types.ObjectId, 
    required: false 
  },
  EMAIL: { 
    type: String, 
    required: true 
  },
  PHONE_NUMBER: { 
    type: String, 
    required: true 
  },
  PASWORD: { 
    type: String, 
    required: true 
  },
  ROLE: {
    ADMIN: { 
      type: Boolean 
    },
    BRANCH_MANAGER: { 
      type: Boolean 
    },
    STAFF: { 
      type: Boolean 
    },
    _id: false // Disables the creation of an _id field for this subdocument
  },
  ADDRESS: { 
    type: String, 
    required: true 
  },
  GENDER: { 
    type: String, 
    required: true 
  },
  IS_BLOCKED: {
    TIME: { 
      type: Date 
    },
    CHECK: { 
      type: Boolean 
    },
    _id: false // Disables the creation of an _id field for this subdocument
  }
},
{ versionKey: false }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
