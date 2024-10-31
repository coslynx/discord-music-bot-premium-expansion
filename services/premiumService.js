const { logger } = require('../utils/logger');
const { premiumModel } = require('../models/premiumModel');
const { userModel } = require('../models/userModel');
const { responseHandler } = require('../utils/responseHandler');
const { getPlanDetails } = require('./premiumPlans');

const premiumService = {
  /
    Initializes the premium service by connecting to the database.
   /
  async initialize() {
    try {
      await premiumModel.initialize();
      logger.info('Premium service initialized successfully.');
    } catch (error) {
      logger.error('Error initializing premium service:', error);
    }
  },

  /
    Subscribes a user to a premium plan.
   
    @param {string} userId The user ID of the user to subscribe.
    @param {string} plan The name of the premium plan to subscribe to.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async subscribe(userId, plan) {
    try {
      const planDetails = getPlanDetails(plan);
      if (!planDetails) {
        return responseHandler.error('Invalid premium plan.');
      }

      const user = await userModel.getUser(userId);
      if (user.premium && user.premium.active) {
        return responseHandler.error('You already have an active premium subscription.');
      }

      const subscription = await premiumModel.createSubscription(userId, plan);

      if (subscription) {
        user.premium = {
          plan,
          active: true,
          expires: new Date(Date.now() + (planDetails.duration  1000)),
        };

        await userModel.updateUser(userId, user);
        logger.info(`User ${userId} subscribed to ${plan} plan.`);
        return responseHandler.success(`You have successfully subscribed to the ${plan} plan!`);
      }

      return responseHandler.error('Error subscribing to premium plan.');
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
  async unsubscribe(userId) {
    try {
      const user = await userModel.getUser(userId);
      if (!user.premium || !user.premium.active) {
        return responseHandler.error('You do not have an active premium subscription.');
      }

      const unsubscribeResult = await premiumModel.deleteSubscription(userId);

      if (unsubscribeResult) {
        user.premium = {
          plan: null,
          active: false,
          expires: null,
        };

        await userModel.updateUser(userId, user);
        logger.info(`User ${userId} unsubscribed from premium plan.`);
        return responseHandler.success('You have successfully unsubscribed from your premium plan.');
      }

      return responseHandler.error('Error unsubscribing from premium plan.');
    } catch (error) {
      logger.error(`Error unsubscribing user ${userId} from premium plan:`, error);
      return responseHandler.error('An error occurred while unsubscribing. Please try again later.');
    }
  },

  /
    Gets the premium status for a given user.
   
    @param {string} userId The user ID of the user to check.
    @returns {Promise<{ success: boolean, message: string, data: { plan: string, active: boolean, expires: Date } }>} A promise that resolves with a success flag, message, and premium data.
   /
  async getPremiumStatus(userId) {
    try {
      const user = await userModel.getUser(userId);

      if (user.premium && user.premium.active) {
        return responseHandler.success('Premium Status', {
          plan: user.premium.plan,
          active: user.premium.active,
          expires: user.premium.expires,
        });
      }

      return responseHandler.success('Premium Status', {
        plan: 'free',
        active: false,
        expires: null,
      });
    } catch (error) {
      logger.error(`Error getting premium status for user ${userId}:`, error);
      return responseHandler.error('An error occurred while retrieving premium status. Please try again later.');
    }
  },
};

module.exports = { premiumService };