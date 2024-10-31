const { responseHandler } = require('../utils/responseHandler');
const { logger } = require('../utils/logger');
const { userService } = require('../services/userService');
const { premiumService } = require('../services/premiumService');

const permissionsMiddleware = async (req, res, next) => {
  try {
    // Extract the required information from the request
    const userId = req.params.userId;
    const command = req.params.command;

    // Get user settings
    const userSettings = await userService.getUserData(userId);

    // Check for premium features
    const premium = await premiumService.getPremiumStatus(userId);

    // Define premium-only commands
    const premiumOnlyCommands = ['equalizer', 'volume', 'loop', 'repeat', 'shuffle'];

    // Check for premium command usage
    if (premiumOnlyCommands.includes(command) && premium.plan === 'free') {
      return res.status(403).json(responseHandler.error('This command requires a premium subscription.'));
    }

    // Check for other permissions based on user settings
    // (Implement your permission logic based on userSettings)
    // For example:
    // if (command === 'someCommand' && !userSettings.somePermission) {
    //   return res.status(403).json(responseHandler.error('You do not have permission to use this command.'));
    // }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    logger.error(`Error in permissions middleware: ${error}`);
    res.status(500).json(responseHandler.error('An error occurred while checking permissions. Please try again later.'));
  }
};

module.exports = { permissionsMiddleware };