const { logger } = require('../utils/logger');
const { guildService } = require('../services/guildService');

module.exports = async (client, guild) => {
  try {
    const guildId = guild.id;

    // Create a new guild entry in the database
    await guildService.createGuild(guildId);

    // Log the guild join event
    logger.info(`Joined new guild: ${guild.name} (${guildId})`);

    // Perform any other necessary actions for a new guild, such as setting default settings or sending a welcome message
  } catch (error) {
    logger.error(`Error in guildCreate event handler: ${error}`);
  }
};