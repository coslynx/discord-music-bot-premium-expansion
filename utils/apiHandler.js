const { logger } = require('../utils/logger');
const { responseHandler } = require('../utils/responseHandler');
const { userService } = require('../services/userService');
const { premiumService } = require('../services/premiumService');
const { spotifyHandler } = require('../utils/spotifyHandler');
const { getPlanDetails } = require('../services/premiumPlans');

const apiHandler = {
  /
    Gets the Spotify authentication URL for user authorization.
   
    @returns {Promise<{ success: boolean, message: string, data: string }>} A promise that resolves with a success flag, message, and the authorization URL.
   /
  async getAuthUrl() {
    try {
      const authUrl = await spotifyHandler.getAuthUrl();
      return responseHandler.success('Authentication URL', authUrl);
    } catch (error) {
      logger.error('Error getting Spotify authentication URL:', error);
      return responseHandler.error('An error occurred while generating the Spotify authentication URL. Please try again later.');
    }
  },

  /
    Disconnects a user's Spotify account.
   
    @param {string} userId The user ID of the user to disconnect.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async disconnectSpotify(userId) {
    try {
      const userSettings = await userService.getUserData(userId);
      if (!userSettings.spotify.connected) {
        return responseHandler.error('Your Spotify account is not connected.');
      }

      const disconnectResult = await spotifyHandler.disconnect(userId);

      if (disconnectResult.success) {
        logger.info(`Spotify account disconnected for user ${userId}.`);
        return responseHandler.success('Spotify account disconnected successfully.');
      }

      return responseHandler.error('An error occurred while disconnecting your Spotify account. Please try again later.');
    } catch (error) {
      logger.error(`Error disconnecting Spotify account for user ${userId}:`, error);
      return responseHandler.error('An error occurred while disconnecting your Spotify account. Please try again later.');
    }
  },

  /
    Subscribes a user to a premium plan.
   
    @param {string} userId The user ID of the user to subscribe.
    @param {string} plan The name of the premium plan to subscribe to.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async subscribeToPremium(userId, plan) {
    try {
      const planDetails = getPlanDetails(plan);
      if (!planDetails) {
        return responseHandler.error('Invalid premium plan.');
      }

      const user = await userService.getUserData(userId);
      if (user.premium && user.premium.active) {
        return responseHandler.error('You already have an active premium subscription.');
      }

      const subscriptionResult = await premiumService.subscribe(userId, plan);

      if (subscriptionResult.success) {
        logger.info(`User ${userId} subscribed to ${plan} plan.`);
        return responseHandler.success(`You have successfully subscribed to the ${plan} plan!`);
      }

      return responseHandler.error(subscriptionResult.message);
    } catch (error) {
      logger.error(`Error subscribing user ${userId} to premium plan:`, error);
      return responseHandler.error('An error occurred while subscribing. Please try again later.');
    }
  },

  /
    Unsubscribes a user from their premium plan.
   
    @param {string} userId The user ID of the user to unsubscribe.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async unsubscribeFromPremium(userId) {
    try {
      const user = await userService.getUserData(userId);
      if (!user.premium || !user.premium.active) {
        return responseHandler.error('You do not have an active premium subscription.');
      }

      const unsubscribeResult = await premiumService.unsubscribe(userId);

      if (unsubscribeResult.success) {
        logger.info(`User ${userId} unsubscribed from premium plan.`);
        return responseHandler.success('You have successfully unsubscribed from your premium plan.');
      }

      return responseHandler.error(unsubscribeResult.message);
    } catch (error) {
      logger.error(`Error unsubscribing user ${userId} from premium plan:`, error);
      return responseHandler.error('An error occurred while unsubscribing. Please try again later.');
    }
  },
};

module.exports = { apiHandler };