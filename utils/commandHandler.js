const { logger } = require('./logger');
const { EmbedGenerator } = require('./embedGenerator');
const { musicService } = require('../services/musicService');
const { queueService } = require('../services/queueService');
const { playlistService } = require('../services/playlistService');
const { spotifyHandler } = require('./spotifyHandler');
const { userService } = require('../services/userService');
const { premiumService } = require('../services/premiumService');

const commandHandler = {
  async handlePlayCommand(interaction, guildId, query) {
    try {
      // Check if the bot is already in a voice channel
      if (!interaction.member.voice.channel) {
        const embed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription('You need to be in a voice channel to play music.')
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [embed] });
        return;
      }

      // Check if the bot is already in a voice channel
      if (!interaction.guild.me.voice.channel) {
        // Join the user's voice channel
        const voiceChannel = interaction.member.voice.channel;
        const joinResult = await musicService.joinVoiceChannel(guildId, voiceChannel);

        if (!joinResult.success) {
          const embed = new EmbedGenerator()
            .setTitle('Error')
            .setDescription(joinResult.message)
            .setColor('0xFF0000');
          await interaction.reply({ embeds: [embed] });
          return;
        }
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
            const embed = new EmbedGenerator()
              .setTitle('Playing Playlist')
              .setDescription(`Now playing ${playlistName}!`)
              .setColor('0x0072ff');
            await interaction.reply({ embeds: [embed] });
          } else {
            const errorEmbed = new EmbedGenerator()
              .setTitle('Error')
              .setDescription(queueResult.message)
              .setColor('0xFF0000');
            await interaction.reply({ embeds: [errorEmbed] });
          }
        } else {
          // Handle single song
          if (searchResult.data.tracks.length > 0) {
            const selectedTrack = searchResult.data.tracks[0];
            const queueResult = await musicService.addToQueue(guildId, selectedTrack.track);

            if (queueResult.success) {
              const embed = new EmbedGenerator()
                .setTitle('Now Playing')
                .setDescription(`Now playing ${selectedTrack.info.title} by ${selectedTrack.info.author}!`)
                .setThumbnail(selectedTrack.info.thumbnail)
                .setColor('0x0072ff');
              await interaction.reply({ embeds: [embed] });
            } else {
              const errorEmbed = new EmbedGenerator()
                .setTitle('Error')
                .setDescription(queueResult.message)
                .setColor('0xFF0000');
              await interaction.reply({ embeds: [errorEmbed] });
            }
          } else {
            const errorEmbed = new EmbedGenerator()
              .setTitle('Error')
              .setDescription('No matching songs found.')
              .setColor('0xFF0000');
            await interaction.reply({ embeds: [errorEmbed] });
          }
        }
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(searchResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while playing music. Please try again later.')
        .setColor('0xFF0000');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handlePauseCommand(interaction, guildId) {
    try {
      const pauseResult = await queueService.pauseMusic(guildId);

      if (pauseResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Music Paused')
          .setDescription('The music has been paused.')
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(pauseResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while pausing the music. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleResumeCommand(interaction, guildId) {
    try {
      const resumeResult = await queueService.resumeMusic(guildId);

      if (resumeResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Music Resumed')
          .setDescription('The music has resumed.')
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(resumeResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while resuming the music. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleStopCommand(interaction, guildId) {
    try {
      const stopResult = await queueService.stopMusic(guildId);

      if (stopResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Music Stopped')
          .setDescription('The music has been stopped and the queue has been cleared.')
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(stopResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while stopping the music. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleSkipCommand(interaction, guildId) {
    try {
      const skipResult = await queueService.skipSong(guildId);

      if (skipResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Skipped Song')
          .setDescription('The current song has been skipped.')
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(skipResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while skipping the song. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleQueueCommand(interaction, guildId) {
    try {
      const queueResult = await queueService.getQueue(guildId);

      if (queueResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Music Queue')
          .setDescription(queueResult.data.length > 0
            ? queueResult.data.map((song, index) => `${index + 1}. ${song.title}`).join('\n')
            : 'The queue is empty.'
          )
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(queueResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while getting the queue. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleNowPlayingCommand(interaction, guildId) {
    try {
      const nowPlayingResult = await queueService.getNowPlaying(guildId);

      if (nowPlayingResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Now Playing')
          .setDescription(`${nowPlayingResult.data.title} by ${nowPlayingResult.data.artist}`)
          .setThumbnail(nowPlayingResult.data.thumbnail)
          .addFields(
            { name: 'Duration', value: `\`${nowPlayingResult.data.duration}\`` },
            { name: 'Progress', value: `\`${nowPlayingResult.data.progress}\`` },
            { name: 'Loop Mode', value: `\`${nowPlayingResult.data.loopMode}\`` },
          )
          .setColor('0x0072ff');

        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(nowPlayingResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while getting the now playing information. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleLoopCommand(interaction, guildId, loopMode) {
    try {
      const loopResult = await queueService.setLoopMode(guildId, loopMode);

      if (loopResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Loop Mode')
          .setDescription(`Loop mode set to ${loopMode.toUpperCase()}.`)
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(loopResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while setting the loop mode. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleVolumeCommand(interaction, guildId, volume) {
    try {
      const volumeResult = await musicService.setVolume(guildId, volume);

      if (volumeResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Volume')
          .setDescription(`Volume set to ${volume}%!`)
          .setColor('0x0072ff');

        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(volumeResult.message)
          .setColor('0xFF0000');

        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while setting the volume. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleEqualizerCommand(interaction, guildId, preset) {
    try {
      const equalizerResult = await musicService.setEqualizer(guildId, preset);

      if (equalizerResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Equalizer')
          .setDescription(`Equalizer preset set to ${preset.toUpperCase()}.`)
          .setColor('0x0072ff');

        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(equalizerResult.message)
          .setColor('0xFF0000');

        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while setting the equalizer. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleSearchCommand(interaction, guildId, query) {
    try {
      const searchResult = await musicService.search(query);

      if (searchResult.success) {
        if (searchResult.data.tracks.length > 0) {
          const embed = new EmbedGenerator()
            .setTitle('Search Results')
            .setDescription(searchResult.data.tracks.map((track, index) => `${index + 1}. ${track.info.title} - ${track.info.author}`).join('\n'))
            .setColor('0x0072ff');

          await interaction.reply({ embeds: [embed] });

          const filter = i => i.user.id === interaction.user.id && /^[1-9]$/.test(i.customId);

          const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

          collector.on('collect', async i => {
            const choice = parseInt(i.customId, 10);

            if (choice <= searchResult.data.tracks.length) {
              const selectedTrack = searchResult.data.tracks[choice - 1];
              const queueResult = await musicService.addToQueue(guildId, selectedTrack.track);

              if (queueResult.success) {
                await interaction.editReply({ content: `Added ${selectedTrack.info.title} to the queue.`, components: [] });
              } else {
                const errorEmbed = new EmbedGenerator()
                  .setTitle('Error')
                  .setDescription(queueResult.message)
                  .setColor('0xFF0000');

                await interaction.editReply({ embeds: [errorEmbed], components: [] });
              }
            } else {
              await i.reply({ content: 'Invalid choice. Please select a valid option.', ephemeral: true });
            }
          });

          collector.on('end', collected => {
            if (collected.size === 0) {
              interaction.editReply({ content: 'Search timed out. Please try again.', components: [] });
            }
          });
        } else {
          const errorEmbed = new EmbedGenerator()
            .setTitle('Error')
            .setDescription('No matching songs found.')
            .setColor('0xFF0000');

          await interaction.reply({ embeds: [errorEmbed] });
        }
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(searchResult.message)
          .setColor('0xFF0000');

        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while processing your request. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleCreatePlaylistCommand(interaction, userId, playlistName) {
    try {
      const createResult = await playlistService.createPlaylist(userId, playlistName);

      if (createResult.success) {
        await interaction.reply({ content: `Playlist "${playlistName}" created successfully.` });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(createResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while creating the playlist. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleAddPlaylistCommand(interaction, userId, playlistName, songTitle) {
    try {
      const addResult = await playlistService.addSongToPlaylist(userId, playlistName, songTitle);

      if (addResult.success) {
        await interaction.reply({ content: `Song "${songTitle}" added to playlist "${playlistName}" successfully.` });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(addResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while adding the song to the playlist. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleRemovePlaylistCommand(interaction, userId, playlistName, songTitle) {
    try {
      const removeResult = await playlistService.removeSongFromPlaylist(userId, playlistName, songTitle);

      if (removeResult.success) {
        await interaction.reply({ content: `Song "${songTitle}" removed from playlist "${playlistName}" successfully.` });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(removeResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while removing the song from the playlist. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleShowPlaylistCommand(interaction, userId, playlistName) {
    try {
      const playlist = await playlistService.getPlaylist(userId, playlistName);

      if (playlist.success) {
        if (playlist.data.songs.length > 0) {
          const embed = new EmbedGenerator()
            .setTitle(`Playlist: ${playlistName}`)
            .setDescription(playlist.data.songs.map((song, index) => `${index + 1}. ${song.title}`).join('\n'));

          await interaction.reply({ embeds: [embed] });
        } else {
          const embed = new EmbedGenerator()
            .setTitle(`Playlist: ${playlistName}`)
            .setDescription('This playlist is empty.');

          await interaction.reply({ embeds: [embed] });
        }
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(playlist.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while retrieving the playlist. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handlePlayPlaylistCommand(interaction, guildId, userId, playlistName) {
    try {
      const playlistResult = await playlistService.getPlaylist(userId, playlistName);

      if (playlistResult.success) {
        const songUrls = playlistResult.data.songs.map((song) => song.url);
        const queueResult = await queueService.addSongs(guildId, songUrls);

        if (queueResult.success) {
          const embed = new EmbedGenerator()
            .setTitle(`Now playing: ${playlistName}`)
            .setDescription(`Added ${songUrls.length} songs from the playlist to the queue.`)
            .setColor('0x0072ff');
          await interaction.reply({ embeds: [embed] });
        } else {
          const errorEmbed = new EmbedGenerator()
            .setTitle('Error')
            .setDescription(queueResult.message)
            .setColor('0xFF0000');
          await interaction.reply({ embeds: [errorEmbed] });
        }
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(playlistResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while playing the playlist. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleDeletePlaylistCommand(interaction, userId, playlistName) {
    try {
      const deleteResult = await playlistService.deletePlaylist(userId, playlistName);

      if (deleteResult.success) {
        await interaction.reply({ content: `Playlist "${playlistName}" deleted successfully.` });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(deleteResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while deleting the playlist. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleAlbumCommand(interaction, guildId, albumName, artistName) {
    try {
      const albumResult = await spotifyHandler.getAlbum(albumName, artistName);

      if (albumResult.success) {
        const tracks = albumResult.data.tracks.items;
        const songUrls = tracks.map((track) => track.external_urls.spotify);

        if (songUrls.length > 0) {
          const queueResult = await queueService.addSongs(guildId, songUrls);

          if (queueResult.success) {
            const embed = new EmbedGenerator()
              .setTitle(`Now playing: ${albumResult.data.name} by ${albumResult.data.artists[0].name}`)
              .setDescription(`Added ${tracks.length} songs from the album to the queue.`)
              .setColor('0x0072ff')
              .setImage(albumResult.data.images[0].url);

            await interaction.reply({ embeds: [embed] });
          } else {
            const errorEmbed = new EmbedGenerator()
              .setTitle('Error')
              .setDescription(queueResult.message)
              .setColor('0xFF0000');
            await interaction.reply({ embeds: [errorEmbed] });
          }
        } else {
          const errorEmbed = new EmbedGenerator()
            .setTitle('Error')
            .setDescription('No songs found in this album.')
            .setColor('0xFF0000');
          await interaction.reply({ embeds: [errorEmbed] });
        }
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(albumResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while processing your request. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleShuffleCommand(interaction, guildId) {
    try {
      const shuffleResult = await queueService.shuffleQueue(guildId);

      if (shuffleResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Queue Shuffled')
          .setDescription('The music queue has been shuffled.')
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(shuffleResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while shuffling the queue. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleRepeatCommand(interaction, guildId, repeatMode) {
    try {
      const repeatResult = await queueService.setRepeatMode(guildId, repeatMode);

      if (repeatResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Repeat Mode')
          .setDescription(`Repeat mode set to ${repeatMode.toUpperCase()}.`)
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(repeatResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while setting the repeat mode. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handlePremiumSubscribeCommand(interaction, userId, plan) {
    try {
      const subscriptionResult = await premiumService.subscribe(userId, plan);

      if (subscriptionResult.success) {
        const userSettings = await userService.getUserData(userId);
        await interaction.reply({ content: `You have successfully subscribed to the ${userSettings.premium.plan} plan!` });
      } else {
        await interaction.reply({ content: subscriptionResult.message });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while subscribing to premium. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handlePremiumUnsubscribeCommand(interaction, userId) {
    try {
      const unsubscribeResult = await premiumService.unsubscribe(userId);

      if (unsubscribeResult.success) {
        const userSettings = await userService.getUserData(userId);
        await interaction.reply({ content: 'You have successfully unsubscribed from your premium plan.' });
      } else {
        await interaction.reply({ content: unsubscribeResult.message });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while unsubscribing from premium. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handlePremiumInfoCommand(interaction, userId) {
    try {
      const userSettings = await userService.getUserData(userId);

      if (userSettings.premium) {
        const premiumEmbed = new EmbedGenerator()
          .setTitle('Premium Subscription')
          .addFields(
            { name: 'Plan', value: userSettings.premium.plan },
            { name: 'Status', value: userSettings.premium.active ? 'Active' : 'Inactive' },
            { name: 'Expires', value: userSettings.premium.expires ? userSettings.premium.expires.toLocaleDateString() : 'N/A' },
          )
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [premiumEmbed] });
      } else {
        const noPremiumEmbed = new EmbedGenerator()
          .setTitle('Premium Subscription')
          .setDescription('You do not have an active premium subscription.')
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [noPremiumEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while retrieving premium information. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleSpotifyConnectCommand(interaction, userId) {
    try {
      const authUrl = await spotifyHandler.getAuthUrl();
      await interaction.reply({ content: `Please authorize the bot to access your Spotify library: ${authUrl}` });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while connecting to Spotify. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleSpotifyDisconnectCommand(interaction, userId) {
    try {
      const disconnectResult = await spotifyHandler.disconnect(userId);

      if (disconnectResult.success) {
        const userSettings = await userService.getUserData(userId);
        await interaction.reply({ content: 'Your Spotify account has been disconnected.' });
      } else {
        await interaction.reply({ content: disconnectResult.message });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while disconnecting from Spotify. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleSpotifyPlayCommand(interaction, userId, query) {
    try {
      const userSettings = await userService.getUserData(userId);

      if (userSettings.spotify.connected) {
        const playResult = await spotifyHandler.play(userId, query);

        if (playResult.success) {
          await interaction.reply({ content: `Now playing: ${playResult.songInfo.name}` });
        } else {
          await interaction.reply({ content: playResult.message });
        }
      } else {
        const connectEmbed = new EmbedGenerator()
          .setTitle('Spotify Integration')
          .setDescription('Please connect your Spotify account first.')
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [connectEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while playing from Spotify. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },

  async handleHelpCommand(interaction) {
    try {
      const embed = new EmbedGenerator()
        .setTitle('Music Bot Commands')
        .addFields(
          { name: 'Play', value: '`/play <song name/url/playlist>`' },
          { name: 'Pause', value: '`/pause`' },
          { name: 'Resume', value: '`/resume`' },
          { name: 'Stop', value: '`/stop`' },
          { name: 'Skip', value: '`/skip`' },
          { name: 'Queue', value: '`/queue`' },
          { name: 'Now Playing', value: '`/nowplaying`' },
          { name: 'Loop', value: '`/loop <song/queue>`' },
          { name: 'Volume', value: '`/volume <1-100>`' },
          { name: 'Equalizer', value: '`/equalizer <preset>`' },
          { name: 'Search', value: '`/search <query>`' },
          { name: 'Playlist', value: '`/playlist <action> <name/url>`' },
          { name: 'Album', value: '`/album <name/artist>`' },
          { name: 'Shuffle', value: '`/shuffle`' },
          { name: 'Repeat', value: '`/repeat <song/queue>`' },
          { name: 'Create Playlist', value: '`/createplaylist <name>`' },
          { name: 'Add to Playlist', value: '`/addplaylist <name> <song>`' },
          { name: 'Remove from Playlist', value: '`/removeplaylist <name> <song>`' },
          { name: 'Show Playlist', value: '`/showplaylist <name>`' },
          { name: 'Delete Playlist', value: '`/deleteplaylist <name>`' },
          { name: 'Spotify', value: '`/spotify <action>`' },
          { name: 'Premium', value: '`/premium <action>`' },
          { name: 'Settings', value: '`/settings <action>`' },
        )
        .setColor('0x0072ff');
      await interaction.reply({