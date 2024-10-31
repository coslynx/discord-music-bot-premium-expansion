const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  queue: {
    type: Array,
    default: [],
  },
  volume: {
    type: Number,
    default: 100,
  },
  equalizer: {
    type: String,
    enum: ['flat', 'boostbass', 'boosttreble', 'classical', 'pop', 'rock'],
    default: 'flat',
  },
  loopMode: {
    type: String,
    enum: ['off', 'song', 'queue'],
    default: 'off',
  },
  repeatMode: {
    type: String,
    enum: ['off', 'song', 'queue'],
    default: 'off',
  },
});

const guildModel = mongoose.model('Guild', guildSchema);

module.exports = { guildModel };