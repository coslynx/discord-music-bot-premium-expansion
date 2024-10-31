const mongoose = require('mongoose');

const premiumSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    enum: ['basic', 'pro', 'elite'],
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  expires: {
    type: Date,
    default: null,
  },
});

const premiumModel = mongoose.model('Premium', premiumSchema);

module.exports = { premiumModel };