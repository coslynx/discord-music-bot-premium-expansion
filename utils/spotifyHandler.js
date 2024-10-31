const { logger } = require('../utils/logger');
const { responseHandler } = require('../utils/responseHandler');
const { getUserData, updateUserSettings } = require('../services/userService');
const { getAuthUrl, getAccessToken, refreshAccessToken, getSpotifyTrack, disconnectSpotify } = require('../services/spotifyService');
const { queueService } = require('../services/queueService');
const { musicService } = require('../services/musicService');

const spotifyHandler = {
  /
    Gets the Spotify authentication URL for user authorization.
    @returns {Promise<{ success: boolean, message: string, data: string }>} A promise that resolves with a success flag, message, and the authorization URL.
   /
  async getAuthUrl() {
    try {
      const authUrl = await getAuthUrl();
      return responseHandler.success('Authentication URL', authUrl);
    } catch (error) {
      logger.error('Error getting Spotify authentication URL:', error);
      return responseHandler.error('An error occurred while generating the Spotify authentication URL. Please try again later.');
    }
  },

  /
    Disconnects a user's Spotify account.
    @param {string} userId The user ID of the user to disconnect.
    @returns {Promise<{ success: boolean, message: string }>} A promise that resolves with a success flag and message.
   /
  async disconnect(userId) {
    try {
      const userSettings = await getUserData(userId);
      if (!userSettings.spotify.connected) {
        return responseHandler.error('Your Spotify account is not connected.');
      }

      const disconnectResult = await disconnectSpotify(userId);

      if (disconnectResult.success) {
        logger.info(`Spotify account disconnected for user ${userId}.`);
        return responseHandler.success('Spotify account disconnected successfully.');
      }

      return responseHandler.error('An error occurred while disconnecting your Spotify account. Please try again later.');
    } catch (error) {
      logger.error(`Error disconnecting Spotify account for user ${userId}:`, error);
      return responseHandler.error('An error occurred while disconnecting your Spotify account. Please try again later.');
    }
  },

  /
    Plays a song or playlist from a user's Spotify library.
    @param {string} userId The user ID of the user requesting playback.
    @param {string} query The search query for the song or playlist.
    @returns {Promise<{ success: boolean, message: string, songInfo: { name: string, artists: string[] } }>} A promise that resolves with a success flag, message, and song/playlist information.
   /
  async play(userId, query) {
    try {
      const userSettings = await getUserData(userId);
      if (!userSettings.spotify.connected) {
        return responseHandler.error('Your Spotify account is not connected.');
      }

      const accessToken = userSettings.spotify.accessToken;
      const refreshToken = userSettings.spotify.refreshToken;

      if (!accessToken) {
        const refreshResult = await refreshAccessToken(refreshToken);

        if (refreshResult.success) {
          userSettings.spotify.accessToken = refreshResult.accessToken;
          await updateUserSettings(userId, userSettings);
        } else {
          return responseHandler.error('An error occurred while refreshing your Spotify access token. Please try again later.');
        }
      }

      const spotifyTrackResult = await getSpotifyTrack(query, accessToken);

      if (spotifyTrackResult.success) {
        const songUrl = spotifyTrackResult.data.external_urls.spotify;
        const guildId = spotifyTrackResult.data.guildId;

        if (!guildId) {
          return responseHandler.error('You need to be in a voice channel to play music.');
        }

        const queueResult = await queueService.addSongs(guildId, [songUrl]);
        if (queueResult.success) {
          logger.info(`Added Spotify track ${spotifyTrackResult.data.name} to queue for guild ${guildId}.`);
          return responseHandler.success('Now Playing', {
            songInfo: {
              name: spotifyTrackResult.data.name,
              artists: spotifyTrackResult.data.artists.map((artist) => artist.name),
            },
          });
        }
        return responseHandler.error(queueResult.message);
      }
      return responseHandler.error(spotifyTrackResult.message);
    } catch (error) {
      logger.error(`Error playing Spotify track for user ${userId}:`, error);
      return responseHandler.error('An error occurred while playing the Spotify track. Please try again later.');
    }
  },

  /
    Gets an album from Spotify.
    @param {string} albumName The name of the album to retrieve.
    @param {string} artistName (Optional) The artist of the album.
    @returns {Promise<{ success: boolean, message: string, data: object }>} A promise that resolves with a success flag, message, and the album data.
   /
  async getAlbum(albumName, artistName) {
    try {
      const userSettings = await getUserData(interaction.user.id);
      if (!userSettings.spotify.connected) {
        return responseHandler.error('Your Spotify account is not connected.');
      }

      const accessToken = userSettings.spotify.accessToken;
      const refreshToken = userSettings.spotify.refreshToken;

      if (!accessToken) {
        const refreshResult = await refreshAccessToken(refreshToken);

        if (refreshResult.success) {
          userSettings.spotify.accessToken = refreshResult.accessToken;
          await updateUserSettings(interaction.user.id, userSettings);
        } else {
          return responseHandler.error('An error occurred while refreshing your Spotify access token. Please try again later.');
        }
      }

      const albumResult = await getAlbum(albumName, artistName, accessToken);

      if (albumResult.success) {
        return responseHandler.success('Album Data', albumResult.data);
      }

      return responseHandler.error(albumResult.message);
    } catch (error) {
      logger.error(`Error getting album from Spotify:`, error);
      return responseHandler.error('An error occurred while retrieving the album. Please try again later.');
    }
  },
};

module.exports = { spotifyHandler };