const { logger } = require('../utils/logger');
const { lavalink } = require('../utils/lavalink');
const { responseHandler } = require('../utils/responseHandler');
const { guildModel } = require('../models/guildModel');
const { songModel } = require('../models/songModel');
const { Queue } = require('distube');

const musicService = {
  /
    Initializes the music service by connecting to the Lavalink server.
   /
  async initializeLavalink() {
    try {
      // Connect to Lavalink
      lavalink.connect();
      logger.info('Lavalink connected successfully.');
    } catch (error) {
      logger.error('Error initializing Lavalink:', error);
    }
  },

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
    Searches for a song or playlist.
   
    @param {string} query The search query.
    @returns {Promise<{ success: boolean, message: string, data: { tracks: [{ track: string, info: { title: string, author: string, length: number, thumbnail: string, uri: string } }], playlist: { name: string, tracks: [{ track: string, info: { title: string, author: string, length: number, thumbnail: string, uri: string } }] } } }>} A promise that resolves with a success flag, message, and search data.
   /
  async search(query) {
    try {
      const searchResult = await lavalink.getNode().search(query);
      const response = responseHandler.success('Search Results', {
        tracks: searchResult.tracks.map((track) => ({ track: track.track, info: track.info })),
        playlist: searchResult.playlist ? { name: searchResult.playlist.name, tracks: searchResult.playlist.tracks.map((track) => ({ track: track.track, info: track.info })) } : null,
      });

      return response;
    } catch (error) {
      logger.error('Error searching for music:', error);
      return responseHandler.error('An error occurred while searching for music. Please try again later.');
    }
  },

  /
    Adds a song to the queue for a given guild.
   
    @param {string} guildId The guild ID.
    @param {string} track The Lavalink track identifier.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async addToQueue(guildId, track) {
    try {
      const guild = await guildModel.getGuild(guildId);
      if (!guild) {
        return responseHandler.error('Guild not found.');
      }
      // Queue up the song using Lavalink
      const player = lavalink.get(guildId);
      if (!player) {
        return responseHandler.error('No song is currently playing.');
      }

      // Add the song to the queue
      const songInfo = await lavalink.getNode().decode(track);
      const song = {
        track,
        title: songInfo.title,
        artist: songInfo.author,
        duration: songInfo.length,
        thumbnail: songInfo.thumbnail,
        url: songInfo.uri,
        songId: songInfo.songId,
      };
      // const existingSong = await songModel.getSong(song.title);
      // if (existingSong) {
      //   song.songId = existingSong._id;
      // } else {
      //   const newSong = await songModel.createSong(song);
      //   song.songId = newSong._id;
      // }
      player.queue.add(song);
      // guild.queue = [...guild.queue, ...songs];
      // await guildModel.updateGuild(guildId, guild);

      logger.info(`Added song ${song.title} to queue for guild ${guildId}.`);

      return responseHandler.success('Song added to queue successfully.');
    } catch (error) {
      logger.error(`Error adding song to queue for guild ${guildId}:`, error);
      return responseHandler.error('An error occurred while adding the song to the queue. Please try again later.');
    }
  },

  /
    Sets the volume for a given guild.
   
    @param {string} guildId The guild ID.
    @param {number} volume The volume level (between 1 and 100).
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async setVolume(guildId, volume) {
    try {
      const guild = await guildModel.getGuild(guildId);
      if (!guild) {
        return responseHandler.error('Guild not found.');
      }
      const player = lavalink.get(guildId);
      if (!player) {
        return responseHandler.error('No song is currently playing.');
      }
      // Set the volume using Lavalink
      player.setVolume(volume);
      guild.volume = volume;
      await guildModel.updateGuild(guildId, guild);
      logger.info(`Set volume to ${volume} for guild ${guildId}.`);

      return responseHandler.success('Volume set successfully.');
    } catch (error) {
      logger.error(`Error setting volume for guild ${guildId}:`, error);
      return responseHandler.error('An error occurred while setting the volume. Please try again later.');
    }
  },

  /
    Sets the equalizer settings for a given guild.
   
    @param {string} guildId The guild ID.
    @param {string} preset The equalizer preset to use.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async setEqualizer(guildId, preset) {
    try {
      const guild = await guildModel.getGuild(guildId);
      if (!guild) {
        return responseHandler.error('Guild not found.');
      }
      const player = lavalink.get(guildId);
      if (!player) {
        return responseHandler.error('No song is currently playing.');
      }
      // Set the equalizer settings using Lavalink
      player.setEQ(preset);
      guild.equalizer = preset;
      await guildModel.updateGuild(guildId, guild);
      logger.info(`Set equalizer preset to ${preset} for guild ${guildId}.`);

      return responseHandler.success('Equalizer preset set successfully.');
    } catch (error) {
      logger.error(`Error setting equalizer for guild ${guildId}:`, error);
      return responseHandler.error('An error occurred while setting the equalizer. Please try again later.');
    }
  },
};

module.exports = { musicService };