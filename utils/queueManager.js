const { logger } = require('../utils/logger');
const { lavalink } = require('../utils/lavalink');
const { responseHandler } = require('../utils/responseHandler');
const { guildModel } = require('../models/guildModel');

const queueManager = {
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
    Gets the current queue for a given guild.
   
    @param {string} guildId The guild ID.
    @returns {Promise<{ success: boolean, message: string, data: [{ songId: string, track: string, title: string, artist: string, duration: number, thumbnail: string, url: string }] }>} A promise that resolves with a success flag, message, and queue data.
   /
  async getQueue(guildId) {
    try {
      const guild = await guildModel.getGuild(guildId);
      if (!guild) {
        return responseHandler.error('Guild not found.');
      }

      const queue = guild.queue;

      if (queue.length === 0) {
        return responseHandler.success('Queue Data', []);
      }

      const songs = queue.map((song) => ({
        songId: song.songId,
        track: song.track,
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        thumbnail: song.thumbnail,
        url: song.url,
      }));

      return responseHandler.success('Queue Data', songs);
    } catch (error) {
      logger.error(`Error getting queue for guild ${guildId}:`, error);
      return responseHandler.error('An error occurred while getting the queue. Please try again later.');
    }
  },

  /
    Clears the current queue for a given guild.
   
    @param {string} guildId The guild ID.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async clearQueue(guildId) {
    try {
      const guild = await guildModel.getGuild(guildId);
      if (!guild) {
        return responseHandler.error('Guild not found.');
      }

      guild.queue = [];
      await guildModel.updateGuild(guildId, guild);
      logger.info(`Cleared queue for guild ${guildId}.`);

      return responseHandler.success('Queue cleared successfully.');
    } catch (error) {
      logger.error(`Error clearing queue for guild ${guildId}:`, error);
      return responseHandler.error('An error occurred while clearing the queue. Please try again later.');
    }
  },

  /
    Skips the current song in the queue for a given guild.
   
    @param {string} guildId The guild ID.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async skipSong(guildId) {
    try {
      const guild = await guildModel.getGuild(guildId);
      if (!guild) {
        return responseHandler.error('Guild not found.');
      }

      const player = lavalink.get(guildId);
      if (!player) {
        return responseHandler.error('No song is currently playing.');
      }

      player.stop();
      logger.info(`Skipped song for guild ${guildId}.`);

      return responseHandler.success('Song skipped successfully.');
    } catch (error) {
      logger.error(`Error skipping song for guild ${guildId}:`, error);
      return responseHandler.error('An error occurred while skipping the song. Please try again later.');
    }
  },

  /
    Stops the music and clears the queue for a given guild.
   
    @param {string} guildId The guild ID.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async stopMusic(guildId) {
    try {
      const guild = await guildModel.getGuild(guildId);
      if (!guild) {
        return responseHandler.error('Guild not found.');
      }

      const player = lavalink.get(guildId);
      if (!player) {
        return responseHandler.error('No song is currently playing.');
      }

      player.destroy();
      guild.queue = [];
      await guildModel.updateGuild(guildId, guild);
      logger.info(`Stopped music and cleared queue for guild ${guildId}.`);

      return responseHandler.success('Music stopped and queue cleared successfully.');
    } catch (error) {
      logger.error(`Error stopping music for guild ${guildId}:`, error);
      return responseHandler.error('An error occurred while stopping the music. Please try again later.');
    }
  },

  /
    Pauses the music for a given guild.
   
    @param {string} guildId The guild ID.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async pauseMusic(guildId) {
    try {
      const guild = await guildModel.getGuild(guildId);
      if (!guild) {
        return responseHandler.error('Guild not found.');
      }

      const player = lavalink.get(guildId);
      if (!player) {
        return responseHandler.error('No song is currently playing.');
      }

      player.pause(true);
      logger.info(`Paused music for guild ${guildId}.`);

      return responseHandler.success('Music paused successfully.');
    } catch (error) {
      logger.error(`Error pausing music for guild ${guildId}:`, error);
      return responseHandler.error('An error occurred while pausing the music. Please try again later.');
    }
  },

  /
    Resumes the music for a given guild.
   
    @param {string} guildId The guild ID.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async resumeMusic(guildId) {
    try {
      const guild = await guildModel.getGuild(guildId);
      if (!guild) {
        return responseHandler.error('Guild not found.');
      }

      const player = lavalink.get(guildId);
      if (!player) {
        return responseHandler.error('No song is currently playing.');
      }

      player.pause(false);
      logger.info(`Resumed music for guild ${guildId}.`);

      return responseHandler.success('Music resumed successfully.');
    } catch (error) {
      logger.error(`Error resuming music for guild ${guildId}:`, error);
      return responseHandler.error('An error occurred while resuming the music. Please try again later.');
    }
  },

  /
    Sets the loop mode for a given guild.
   
    @param {string} guildId The guild ID.
    @param {string} loopMode The loop mode to set (off, song, queue).
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async setLoopMode(guildId, loopMode) {
    try {
      const guild = await guildModel.getGuild(guildId);
      if (!guild) {
        return responseHandler.error('Guild not found.');
      }

      const player = lavalink.get(guildId);
      if (!player) {
        return responseHandler.error('No song is currently playing.');
      }

      switch (loopMode) {
        case 'off':
          player.setTrackRepeat(false);
          guild.loopMode = 'off';
          break;
        case 'song':
          player.setTrackRepeat(true);
          guild.loopMode = 'song';
          break;
        case 'queue':
          player.setQueueRepeat(true);
          guild.loopMode = 'queue';
          break;
        default:
          return responseHandler.error('Invalid loop mode.');
      }

      await guildModel.updateGuild(guildId, guild);
      logger.info(`Set loop mode to ${loopMode} for guild ${guildId}.`);

      return responseHandler.success('Loop mode set successfully.');
    } catch (error) {
      logger.error(`Error setting loop mode for guild ${guildId}:`, error);
      return responseHandler.error('An error occurred while setting the loop mode. Please try again later.');
    }
  },

  /
    Sets the repeat mode for a given guild.
   
    @param {string} guildId The guild ID.
    @param {string} repeatMode The repeat mode to set (off, song, queue).
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async setRepeatMode(guildId, repeatMode) {
    try {
      const guild = await guildModel.getGuild(guildId);
      if (!guild) {
        return responseHandler.error('Guild not found.');
      }

      const player = lavalink.get(guildId);
      if (!player) {
        return responseHandler.error('No song is currently playing.');
      }

      switch (repeatMode) {
        case 'off':
          player.setQueueRepeat(false);
          player.setTrackRepeat(false);
          guild.repeatMode = 'off';
          break;
        case 'song':
          player.setTrackRepeat(true);
          guild.repeatMode = 'song';
          break;
        case 'queue':
          player.setQueueRepeat(true);
          guild.repeatMode = 'queue';
          break;
        default:
          return responseHandler.error('Invalid repeat mode.');
      }

      await guildModel.updateGuild(guildId, guild);
      logger.info(`Set repeat mode to ${repeatMode} for guild ${guildId}.`);

      return responseHandler.success('Repeat mode set successfully.');
    } catch (error) {
      logger.error(`Error setting repeat mode for guild ${guildId}:`, error);
      return responseHandler.error('An error occurred while setting the repeat mode. Please try again later.');
    }
  },

  /
    Shuffles the current queue for a given guild.
   
    @param {string} guildId The guild ID.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async shuffleQueue(guildId) {
    try {
      const guild = await guildModel.getGuild(guildId);
      if (!guild) {
        return responseHandler.error('Guild not found.');
      }

      const player = lavalink.get(guildId);
      if (!player) {
        return responseHandler.error('No song is currently playing.');
      }

      const queue = guild.queue;
      for (let i = queue.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random()  (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }
      guild.queue = queue;
      await guildModel.updateGuild(guildId, guild);
      logger.info(`Shuffled queue for guild ${guildId}.`);

      return responseHandler.success('Queue shuffled successfully.');
    } catch (error) {
      logger.error(`Error shuffling queue for guild ${guildId}:`, error);
      return responseHandler.error('An error occurred while shuffling the queue. Please try again later.');
    }
  },
};

module.exports = { queueManager };