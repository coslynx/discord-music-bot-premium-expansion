const { logger } = require('../utils/logger');
const { userModel } = require('../models/userModel');
const { responseHandler } = require('../utils/responseHandler');

const userService = {
  /
    Initializes the user service by connecting to the database.
   /
  async initialize() {
    try {
      await userModel.initialize();
      logger.info('User service initialized successfully.');
    } catch (error) {
      logger.error('Error initializing user service:', error);
    }
  },

  /
    Gets the user data for a given user ID.
   
    @param {string} userId The user ID of the user to retrieve data for.
    @returns {Promise<{ success: boolean, message: string, data: { userId: string, volume: number, equalizer: string, theme: string, spotify: { connected: boolean, accessToken: string, refreshToken: string }, premium: { plan: string, active: boolean, expires: Date } } }>} A promise that resolves with a success flag, message, and user data.
   /
  async getUserData(userId) {
    try {
      const user = await userModel.getUser(userId);
      if (user) {
        return responseHandler.success('User Data', user);
      }
      return responseHandler.error('User not found.');
    } catch (error) {
      logger.error(`Error getting user data for user ${userId}:`, error);
      return responseHandler.error('An error occurred while retrieving user data. Please try again later.');
    }
  },

  /
    Updates the user settings for a given user ID.
   
    @param {string} userId The user ID of the user to update settings for.
    @param {object} settings The updated user settings.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async updateUserSettings(userId, settings) {
    try {
      const updateResult = await userModel.updateUser(userId, settings);
      if (updateResult) {
        logger.info(`User settings updated for user ${userId}.`);
        return responseHandler.success('User Settings Updated');
      }
      return responseHandler.error('Error updating user settings.');
    } catch (error) {
      logger.error(`Error updating user settings for user ${userId}:`, error);
      return responseHandler.error('An error occurred while updating user settings. Please try again later.');
    }
  },
};

module.exports = { userService };