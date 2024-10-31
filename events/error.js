const { logger } = require('../utils/logger');

module.exports = (client, error) => {
  logger.error(error);

  if (error.message === 'Invalid Request') {
    // Handle invalid request errors specifically
  } else if (error.message === 'Ratelimited') {
    // Handle rate limit errors specifically
  } else if (error.message === 'No matching songs found.') {
    // Handle "No matching songs found" errors specifically
  } else {
    // Handle generic errors
  }

  // Additional error handling logic
};