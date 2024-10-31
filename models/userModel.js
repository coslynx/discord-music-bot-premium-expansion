const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
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
  theme: {
    type: String,
    enum: ['dark', 'light'],
    default: 'dark',
  },
  spotify: {
    connected: {
      type: Boolean,
      default: false,
    },
    accessToken: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  premium: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'elite'],
      default: 'free',
    },
    active: {
      type: Boolean,
      default: false,
    },
    expires: {
      type: Date,
      default: null,
    },
  },
});

userSchema.statics.initialize = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('User model initialized successfully.');
  } catch (error) {
    logger.error('Error initializing user model:', error);
  }
};

userSchema.statics.getUser = async (userId) => {
  try {
    const user = await userModel.findOne({ userId });
    return user;
  } catch (error) {
    logger.error(`Error getting user data for user ${userId}:`, error);
    throw error;
  }
};

userSchema.statics.updateUser = async (userId, settings) => {
  try {
    const updateResult = await userModel.findOneAndUpdate({ userId }, settings, { new: true });
    return updateResult;
  } catch (error) {
    logger.error(`Error updating user settings for user ${userId}:`, error);
    throw error;
  }
};

const userModel = mongoose.model('User', userSchema);

module.exports = { userModel };