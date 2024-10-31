const { responseHandler } = require('../utils/responseHandler');
const { logger } = require('../utils/logger');
const { userService } = require('../services/userService');
const { premiumService } = require('../services/premiumService');
const jwt = require('jsonwebtoken');

const authenticationMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json(responseHandler.error('Authentication required.'));
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    const userSettings = await userService.getUserData(userId);
    if (!userSettings.success) {
      return res.status(401).json(responseHandler.error('Invalid user token.'));
    }

    const premium = await premiumService.getPremiumStatus(userId);
    if (!premium.success) {
      return res.status(401).json(responseHandler.error('Invalid user token.'));
    }

    req.userId = userId;
    req.premium = premium.data;

    next();
  } catch (error) {
    logger.error('Error in authentication middleware:', error);
    res.status(500).json(responseHandler.error('An error occurred during authentication. Please try again later.'));
  }
};

module.exports = { authenticationMiddleware };