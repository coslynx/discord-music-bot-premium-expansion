const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
  }],
});

playlistSchema.statics.initialize = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Playlist model initialized successfully.');
  } catch (error) {
    logger.error('Error initializing playlist model:', error);
  }
};

playlistSchema.statics.createPlaylist = async (userId, playlistName) => {
  try {
    const newPlaylist = new playlistModel({ userId, name: playlistName });
    await newPlaylist.save();
    return newPlaylist;
  } catch (error) {
    logger.error(`Error creating playlist for user ${userId}:`, error);
    throw error;
  }
};

playlistSchema.statics.getPlaylist = async (userId, playlistName) => {
  try {
    const playlist = await playlistModel.findOne({ userId, name: playlistName });
    return playlist;
  } catch (error) {
    logger.error(`Error getting playlist for user ${userId}:`, error);
    throw error;
  }
};

playlistSchema.statics.addSong = async (playlistId, songId) => {
  try {
    const playlist = await playlistModel.findById(playlistId);
    if (!playlist) {
      return false;
    }
    playlist.songs.push(songId);
    await playlist.save();
    return true;
  } catch (error) {
    logger.error(`Error adding song to playlist ${playlistId}:`, error);
    throw error;
  }
};

playlistSchema.statics.removeSong = async (playlistId, songId) => {
  try {
    const playlist = await playlistModel.findById(playlistId);
    if (!playlist) {
      return false;
    }
    playlist.songs = playlist.songs.filter((id) => id !== songId);
    await playlist.save();
    return true;
  } catch (error) {
    logger.error(`Error removing song from playlist ${playlistId}:`, error);
    throw error;
  }
};

playlistSchema.statics.deletePlaylist = async (playlistId) => {
  try {
    const deleteResult = await playlistModel.findByIdAndDelete(playlistId);
    return deleteResult;
  } catch (error) {
    logger.error(`Error deleting playlist ${playlistId}:`, error);
    throw error;
  }
};

const playlistModel = mongoose.model('Playlist', playlistSchema);

module.exports = { playlistModel };