const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  songId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  thumbnail: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
});

const songModel = mongoose.model('Song', songSchema);

module.exports = { songModel };