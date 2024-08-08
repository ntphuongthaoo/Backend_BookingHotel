const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MetadataRoomSchema = new Schema({
  ROOM_ID: {
    type: Schema.Types.ObjectId,
    required: true
  },
  TOTAL_BOOKINGS: {
    type: Number,
    required: true
  },
  TOTAL_REVIEWS: {
    type: Number,
    required: true
  },
  AVERAGE_RATING: {
    type: Number,
    required: true
  },
  PENDING_BOOKINGS: {
    type: Number,
    required: true
  }
}, {
  versionKey: false
});

const MetadataRoom = mongoose.model('MetadataRoom', MetadataRoomSchema);

module.exports = MetadataRoom;
