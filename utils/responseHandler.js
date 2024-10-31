const { logger } = require('./logger');

const responseHandler = {
  /
    Creates a successful response object.
   
    @param {string} message The success message to be displayed.
    @param {any} data (Optional) Additional data to be included in the response.
    @returns {Promise<{ success: boolean, message: string, data: any }>} A promise that resolves with a successful response object.
   /
  success(message, data) {
    return new Promise((resolve) => {
      resolve({
        success: true,
        message,
        data,
      });
    });
  },

  /
    Creates an error response object.
   
    @param {string} message The error message to be displayed.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with an error response object.
   /
  error(message) {
    return new Promise((resolve) => {
      logger.error(message);
      resolve({
        success: false,
        message,
      });
    });
  },
};

module.exports = { responseHandler };