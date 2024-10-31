const express = require('express');
const router = express.Router();
const { apiHandler } = require('../utils/apiHandler');
const { responseHandler } = require('../utils/responseHandler');
const { logger } = require('../utils/logger');

// Get Spotify authentication URL
router.get('/spotify/auth', async (req, res) => {
  try {
    const authUrlResult = await apiHandler.getAuthUrl();

    if (authUrlResult.success) {
      res.status(200).json(authUrlResult);
    } else {
      res.status(400).json(authUrlResult);
    }
  } catch (error) {
    logger.error('Error getting Spotify authentication URL:', error);
    res.status(500).json(responseHandler.error('An error occurred while generating the Spotify authentication URL. Please try again later.'));
  }
});

// Disconnect Spotify account
router.post('/spotify/disconnect/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const disconnectResult = await apiHandler.disconnectSpotify(userId);

    if (disconnectResult.success) {
      res.status(200).json(disconnectResult);
    } else {
      res.status(400).json(disconnectResult);
    }
  } catch (error) {
    logger.error(`Error disconnecting Spotify account for user ${userId}:`, error);
    res.status(500).json(responseHandler.error('An error occurred while disconnecting your Spotify account. Please try again later.'));
  }
});

// Subscribe to premium plan
router.post('/premium/subscribe/:userId/:plan', async (req, res) => {
  const userId = req.params.userId;
  const plan = req.params.plan;

  try {
    const subscriptionResult = await apiHandler.subscribeToPremium(userId, plan);

    if (subscriptionResult.success) {
      res.status(200).json(subscriptionResult);
    } else {
      res.status(400).json(subscriptionResult);
    }
  } catch (error) {
    logger.error(`Error subscribing user ${userId} to premium plan:`, error);
    res.status(500).json(responseHandler.error('An error occurred while subscribing. Please try again later.'));
  }
});

// Unsubscribe from premium plan
router.post('/premium/unsubscribe/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const unsubscribeResult = await apiHandler.unsubscribeFromPremium(userId);

    if (unsubscribeResult.success) {
      res.status(200).json(unsubscribeResult);
    } else {
      res.status(400).json(unsubscribeResult);
    }
  } catch (error) {
    logger.error(`Error unsubscribing user ${userId} from premium plan:`, error);
    res.status(500).json(responseHandler.error('An error occurred while unsubscribing. Please try again later.'));
  }
});

module.exports = router;