const express = require('express');
const router = express.Router();
const { musicService } = require('../services/musicService');
const { queueService } = require('../services/queueService');
const { responseHandler } = require('../utils/responseHandler');

router.get('/queue/:guildId', async (req, res) => {
  const guildId = req.params.guildId;

  try {
    const queueResult = await queueService.getQueue(guildId);

    if (queueResult.success) {
      res.status(200).json(queueResult);
    } else {
      res.status(400).json(queueResult);
    }
  } catch (error) {
    logger.error(`Error getting queue for guild ${guildId}:`, error);
    res.status(500).json(responseHandler.error('An error occurred while getting the queue. Please try again later.'));
  }
});

router.post('/play/:guildId', async (req, res) => {
  const guildId = req.params.guildId;
  const query = req.body.query;

  try {
    // Check if the bot is already in a voice channel
    const voiceStateResult = await musicService.getVoiceState(guildId);

    if (!voiceStateResult.success) {
      return res.status(400).json(voiceStateResult);
    }

    // Search for the song or playlist
    const searchResult = await musicService.search(query);

    if (searchResult.success) {
      // Handle playlist
      if (searchResult.data.playlist) {
        const playlistName = searchResult.data.playlist.name;
        const trackUrls = searchResult.data.playlist.tracks.map((track) => track.track);
        const queueResult = await queueService.addSongs(guildId, trackUrls);

        if (queueResult.success) {
          res.status(200).json(responseHandler.success(`Now playing ${playlistName}!`));
        } else {
          res.status(400).json(queueResult);
        }
      } else {
        // Handle single song
        if (searchResult.data.tracks.length > 0) {
          const selectedTrack = searchResult.data.tracks[0];
          const queueResult = await musicService.addToQueue(guildId, selectedTrack.track);

          if (queueResult.success) {
            res.status(200).json(responseHandler.success(`Now playing ${selectedTrack.info.title} by ${selectedTrack.info.author}!`));
          } else {
            res.status(400).json(queueResult);
          }
        } else {
          res.status(400).json(responseHandler.error('No matching songs found.'));
        }
      }
    } else {
      res.status(400).json(searchResult);
    }
  } catch (error) {
    logger.error(`Error playing music for guild ${guildId}:`, error);
    res.status(500).json(responseHandler.error('An error occurred while playing music. Please try again later.'));
  }
});

router.post('/pause/:guildId', async (req, res) => {
  const guildId = req.params.guildId;

  try {
    const pauseResult = await queueService.pauseMusic(guildId);

    if (pauseResult.success) {
      res.status(200).json(responseHandler.success('Music paused successfully.'));
    } else {
      res.status(400).json(pauseResult);
    }
  } catch (error) {
    logger.error(`Error pausing music for guild ${guildId}:`, error);
    res.status(500).json(responseHandler.error('An error occurred while pausing the music. Please try again later.'));
  }
});

router.post('/resume/:guildId', async (req, res) => {
  const guildId = req.params.guildId;

  try {
    const resumeResult = await queueService.resumeMusic(guildId);

    if (resumeResult.success) {
      res.status(200).json(responseHandler.success('Music resumed successfully.'));
    } else {
      res.status(400).json(resumeResult);
    }
  } catch (error) {
    logger.error(`Error resuming music for guild ${guildId}:`, error);
    res.status(500).json(responseHandler.error('An error occurred while resuming the music. Please try again later.'));
  }
});

router.post('/stop/:guildId', async (req, res) => {
  const guildId = req.params.guildId;

  try {
    const stopResult = await queueService.stopMusic(guildId);

    if (stopResult.success) {
      res.status(200).json(responseHandler.success('Music stopped successfully.'));
    } else {
      res.status(400).json(stopResult);
    }
  } catch (error) {
    logger.error(`Error stopping music for guild ${guildId}:`, error);
    res.status(500).json(responseHandler.error('An error occurred while stopping the music. Please try again later.'));
  }
});

router.post('/skip/:guildId', async (req, res) => {
  const guildId = req.params.guildId;

  try {
    const skipResult = await queueService.skipSong(guildId);

    if (skipResult.success) {
      res.status(200).json(responseHandler.success('Song skipped successfully.'));
    } else {
      res.status(400).json(skipResult);
    }
  } catch (error) {
    logger.error(`Error skipping song for guild ${guildId}:`, error);
    res.status(500).json(responseHandler.error('An error occurred while skipping the song. Please try again later.'));
  }
});

router.post('/loop/:guildId/:loopMode', async (req, res) => {
  const guildId = req.params.guildId;
  const loopMode = req.params.loopMode;

  try {
    const loopResult = await queueService.setLoopMode(guildId, loopMode);

    if (loopResult.success) {
      res.status(200).json(responseHandler.success(`Loop mode set to ${loopMode.toUpperCase()}.`));
    } else {
      res.status(400).json(loopResult);
    }
  } catch (error) {
    logger.error(`Error setting loop mode for guild ${guildId}:`, error);
    res.status(500).json(responseHandler.error('An error occurred while setting the loop mode. Please try again later.'));
  }
});

router.post('/volume/:guildId/:volume', async (req, res) => {
  const guildId = req.params.guildId;
  const volume = parseInt(req.params.volume, 10);

  try {
    const volumeResult = await musicService.setVolume(guildId, volume);

    if (volumeResult.success) {
      res.status(200).json(responseHandler.success(`Volume set to ${volume}%!`));
    } else {
      res.status(400).json(volumeResult);
    }
  } catch (error) {
    logger.error(`Error setting volume for guild ${guildId}:`, error);
    res.status(500).json(responseHandler.error('An error occurred while setting the volume. Please try again later.'));
  }
});

router.post('/equalizer/:guildId/:preset', async (req, res) => {
  const guildId = req.params.guildId;
  const preset = req.params.preset;

  try {
    const equalizerResult = await musicService.setEqualizer(guildId, preset);

    if (equalizerResult.success) {
      res.status(200).json(responseHandler.success(`Equalizer preset set to ${preset.toUpperCase()}.`));
    } else {
      res.status(400).json(equalizerResult);
    }
  } catch (error) {
    logger.error(`Error setting equalizer for guild ${guildId}:`, error);
    res.status(500).json(responseHandler.error('An error occurred while setting the equalizer. Please try again later.'));
  }
});

router.post('/shuffle/:guildId', async (req, res) => {
  const guildId = req.params.guildId;

  try {
    const shuffleResult = await queueService.shuffleQueue(guildId);

    if (shuffleResult.success) {
      res.status(200).json(responseHandler.success('Queue shuffled successfully.'));
    } else {
      res.status(400).json(shuffleResult);
    }
  } catch (error) {
    logger.error(`Error shuffling queue for guild ${guildId}:`, error);
    res.status(500).json(responseHandler.error('An error occurred while shuffling the queue. Please try again later.'));
  }
});

module.exports = router;