const { logger } = require('../utils/logger');
const { queueService } = require('../services/queueService');
const { musicService } = require('../services/musicService');

module.exports = async (client, oldState, newState) => {
  try {
    const guildId = oldState.guild.id;

    // If the bot is in a voice channel, but the user leaves, leave the channel.
    if (oldState.channel && newState.channel === null && oldState.member.user.id === client.user.id) {
      await musicService.leaveVoiceChannel(guildId);
    }

    // If the user joins a voice channel and the bot is not in a voice channel, join the user's channel.
    if (newState.channel && !newState.member.user.bot && newState.member.user.id !== client.user.id && !newState.guild.me.voice.channel) {
      await musicService.joinVoiceChannel(guildId, newState.channel);
    }

    // If the bot is in a voice channel and the user leaves, check if the bot is the only one left in the channel.
    if (oldState.channel && newState.channel === null && oldState.member.user.id !== client.user.id) {
      const membersInChannel = oldState.channel.members.filter(member => !member.user.bot).size;

      // If the bot is alone in the channel, leave the channel.
      if (membersInChannel === 0) {
        await musicService.leaveVoiceChannel(guildId);
      }
    }
  } catch (error) {
    logger.error(`Error in voiceStateUpdate event handler: ${error}`);
  }
};