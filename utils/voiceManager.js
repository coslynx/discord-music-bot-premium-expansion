const { logger } = require('../utils/logger');
const { lavalink } = require('../utils/lavalink');
const { responseHandler } = require('../utils/responseHandler');
const { guildModel } = require('../models/guildModel');

const voiceManager = {
  /
     Joins a voice channel for a given guild.
   
    @param {string} guildId The guild ID.
    @param {VoiceChannel} voiceChannel The voice channel to join.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async joinVoiceChannel(guildId, voiceChannel) {
    try {
      // Join the voice channel
      await lavalink.join(guildId, voiceChannel);
      logger.info(`Joined voice channel ${voiceChannel.name} for guild ${guildId}.`);
      return responseHandler.success('Joined voice channel successfully.');
    } catch (error) {
      logger.error(`Error joining voice channel for guild ${guildId}:`, error);
      return responseHandler.error('An error occurred while joining the voice channel. Please try again later.');
    }
  },

  /
     Leaves a voice channel for a given guild.
   
    @param {string} guildId The guild ID.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async leaveVoiceChannel(guildId) {
    try {
      // Leave the voice channel
      await lavalink.leave(guildId);
      logger.info(`Left voice channel for guild ${guildId}.`);
      return responseHandler.success('Left voice channel successfully.');
    } catch (error) {
      logger.error(`Error leaving voice channel for guild ${guildId}:`, error);
      return responseHandler.error('An error occurred while leaving the voice channel. Please try again later.');
    }
  },

  /
     Gets the current voice state of the bot for a given guild.
   
    @param {string} guildId The guild ID.
    @returns {Promise<{ success: boolean, message: string, data: { guildId: string, connected: boolean, channelId: string } }>} A promise that resolves with a success flag, message, and voice state data.
   /
  async getVoiceState(guildId) {
    try {
      // Check if the bot is connected to a voice channel
      const player = lavalink.get(guildId);
      if (player) {
        return responseHandler.success('Voice State', {
          guildId,
          connected: true,
          channelId: player.voiceChannel.id,
        });
      }
      return responseHandler.success('Voice State', {
        guildId,
        connected: false,
        channelId: null,
      });
    } catch (error) {
      logger.error(`Error getting voice state for guild ${guildId}:`, error);
      return responseHandler.error('An error occurred while getting the voice state. Please try again later.');
    }
  },
};

module.exports = { voiceManager };