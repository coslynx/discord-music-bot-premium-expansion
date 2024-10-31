const { logger } = require('../utils/logger');
const { playlistModel } = require('../models/playlistModel');
const { songModel } = require('../models/songModel');
const { responseHandler } = require('../utils/responseHandler');

const playlistService = {
  /
    Initializes the playlist service by connecting to the database.
   /
  async initialize() {
    try {
      await playlistModel.initialize();
      logger.info('Playlist service initialized successfully.');
    } catch (error) {
      logger.error('Error initializing playlist service:', error);
    }
  },

  /
    Creates a new playlist for a given user.
   
    @param {string} userId The user ID of the user creating the playlist.
    @param {string} playlistName The name of the playlist to create.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async createPlaylist(userId, playlistName) {
    try {
      const existingPlaylist = await playlistModel.getPlaylist(userId, playlistName);
      if (existingPlaylist) {
        return responseHandler.error('A playlist with this name already exists.');
      }

      const newPlaylist = await playlistModel.createPlaylist(userId, playlistName);
      if (newPlaylist) {
        logger.info(`Playlist "${playlistName}" created for user ${userId}.`);
        return responseHandler.success('Playlist created successfully.');
      }

      return responseHandler.error('Error creating playlist.');
    } catch (error) {
      logger.error(`Error creating playlist for user ${userId}:`, error);
      return responseHandler.error('An error occurred while creating the playlist. Please try again later.');
    }
  },

  /
    Adds a song to a playlist.
   
    @param {string} userId The user ID of the user adding the song.
    @param {string} playlistName The name of the playlist to add the song to.
    @param {string} songTitle The title of the song to add.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async addSongToPlaylist(userId, playlistName, songTitle) {
    try {
      const playlist = await playlistModel.getPlaylist(userId, playlistName);
      if (!playlist) {
        return responseHandler.error('Playlist not found.');
      }

      const song = await songModel.getSong(songTitle);
      if (!song) {
        return responseHandler.error('Song not found.');
      }

      const addResult = await playlistModel.addSong(playlist._id, song._id);
      if (addResult) {
        logger.info(`Song "${songTitle}" added to playlist "${playlistName}" for user ${userId}.`);
        return responseHandler.success('Song added to playlist successfully.');
      }

      return responseHandler.error('Error adding song to playlist.');
    } catch (error) {
      logger.error(`Error adding song to playlist for user ${userId}:`, error);
      return responseHandler.error('An error occurred while adding the song to the playlist. Please try again later.');
    }
  },

  /
    Removes a song from a playlist.
   
    @param {string} userId The user ID of the user removing the song.
    @param {string} playlistName The name of the playlist to remove the song from.
    @param {string} songTitle The title of the song to remove.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async removeSongFromPlaylist(userId, playlistName, songTitle) {
    try {
      const playlist = await playlistModel.getPlaylist(userId, playlistName);
      if (!playlist) {
        return responseHandler.error('Playlist not found.');
      }

      const song = await songModel.getSong(songTitle);
      if (!song) {
        return responseHandler.error('Song not found.');
      }

      const removeResult = await playlistModel.removeSong(playlist._id, song._id);
      if (removeResult) {
        logger.info(`Song "${songTitle}" removed from playlist "${playlistName}" for user ${userId}.`);
        return responseHandler.success('Song removed from playlist successfully.');
      }

      return responseHandler.error('Error removing song from playlist.');
    } catch (error) {
      logger.error(`Error removing song from playlist for user ${userId}:`, error);
      return responseHandler.error('An error occurred while removing the song from the playlist. Please try again later.');
    }
  },

  /
    Gets a playlist for a given user.
   
    @param {string} userId The user ID of the user owning the playlist.
    @param {string} playlistName The name of the playlist to retrieve.
    @returns {Promise<{ success: boolean, message: string, data: { playlistId: string, name: string, songs: [{ songId: string, title: string, url: string }] } }>} A promise that resolves with a success flag, message, and playlist data.
   /
  async getPlaylist(userId, playlistName) {
    try {
      const playlist = await playlistModel.getPlaylist(userId, playlistName);
      if (!playlist) {
        return responseHandler.error('Playlist not found.');
      }

      const songs = await Promise.all(playlist.songs.map(async (songId) => {
        const song = await songModel.getSongById(songId);
        if (song) {
          return {
            songId: song._id,
            title: song.title,
            url: song.url,
          };
        }
        return null;
      }));

      const validSongs = songs.filter((song) => song !== null);
      const playlistData = {
        playlistId: playlist._id,
        name: playlist.name,
        songs: validSongs,
      };
      return responseHandler.success('Playlist Data', playlistData);
    } catch (error) {
      logger.error(`Error getting playlist for user ${userId}:`, error);
      return responseHandler.error('An error occurred while retrieving the playlist. Please try again later.');
    }
  },

  /
    Deletes a playlist for a given user.
   
    @param {string} userId The user ID of the user deleting the playlist.
    @param {string} playlistName The name of the playlist to delete.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async deletePlaylist(userId, playlistName) {
    try {
      const playlist = await playlistModel.getPlaylist(userId, playlistName);
      if (!playlist) {
        return responseHandler.error('Playlist not found.');
      }

      const deleteResult = await playlistModel.deletePlaylist(playlist._id);
      if (deleteResult) {
        logger.info(`Playlist "${playlistName}" deleted for user ${userId}.`);
        return responseHandler.success('Playlist deleted successfully.');
      }

      return responseHandler.error('Error deleting playlist.');
    } catch (error) {
      logger.error(`Error deleting playlist for user ${userId}:`, error);
      return responseHandler.error('An error occurred while deleting the playlist. Please try again later.');
    }
  },
};

module.exports = { playlistService };