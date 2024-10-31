const { logger } = require('../utils/logger');
const { queueService } = require('../services/queueService');
const { musicService } = require('../services/musicService');

module.exports = async (client, guild) => {
  try {
    const guildId = guild.id;

    // Leave voice channel if the bot is in one
    if (guild.me.voice.channel) {
      await musicService.leaveVoiceChannel(guildId);
    }

    // Clear queue for the guild
    await queueService.clearQueue(guildId);

    // Remove guild from the database
    // (Implement guild deletion logic here)
  } catch (error) {
    logger.error(`Error in guildDelete event handler: ${error}`);
  }
};