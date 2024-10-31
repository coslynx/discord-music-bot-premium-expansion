const { logger } = require('./logger');
const { EmbedGenerator } = require('./embedGenerator');

const errorHandler = {
  /
    Handles errors gracefully, logging them and providing appropriate responses to users.
   
    @param {Error} error The error object to be handled.
    @param {Interaction} interaction The Discord interaction object.
    @returns {Promise<void>} A promise that resolves when the error handling is complete.
   /
  async handleError(error, interaction) {
    logger.error(error);

    try {
      // Handle specific error types
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
    } catch (e) {
      logger.error('Error in error handler:', e);
    }

    // Send an error message to the user
    if (interaction) {
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred. Please try again later.')
        .setColor('0xFF0000');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};

module.exports = { errorHandler };