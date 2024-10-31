const { logger } = require('../utils/logger');
const { commandHandler } = require('../utils/commandHandler');
const { queueService } = require('../services/queueService');
const { musicService } = require('../services/musicService');
const { userService } = require('../services/userService');
const { premiumService } = require('../services/premiumService');

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    const command = interaction.commandName;

    // Get user settings
    const userSettings = await userService.getUserData(userId);

    // Check for premium features
    const premium = await premiumService.getPremiumStatus(userId);

    // Check for voice channel
    if (command !== 'help' && command !== 'settings' && command !== 'premium' && command !== 'spotify' && command !== 'playlist' && command !== 'createplaylist' && command !== 'addplaylist' && command !== 'removeplaylist' && command !== 'showplaylist' && command !== 'deleteplaylist' && command !== 'spotify') {
      if (!interaction.member.voice.channel) {
        const embed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription('You need to be in a voice channel to use this command.')
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [embed] });
        return;
      }
    }

    // Check if the bot is already in a voice channel
    if (command !== 'help' && command !== 'settings' && command !== 'premium' && command !== 'spotify' && command !== 'playlist' && command !== 'createplaylist' && command !== 'addplaylist' && command !== 'removeplaylist' && command !== 'showplaylist' && command !== 'deleteplaylist' && command !== 'spotify') {
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
    }

    // Check for premium command usage
    if (premium.plan === 'free' && (command === 'equalizer' || command === 'volume' || command === 'loop' || command === 'repeat' || command === 'shuffle')) {
      const embed = new EmbedGenerator()
        .setTitle('Premium Feature')
        .setDescription('This command requires a premium subscription.')
        .setColor('0xFF0000');
      await interaction.reply({ embeds: [embed] });
      return;
    }

    // Process user commands
    if (command === 'play') {
      const query = interaction.options.getString('query');
      await commandHandler.handlePlayCommand(interaction, guildId, query);
    } else if (command === 'pause') {
      await commandHandler.handlePauseCommand(interaction, guildId);
    } else if (command === 'resume') {
      await commandHandler.handleResumeCommand(interaction, guildId);
    } else if (command === 'stop') {
      await commandHandler.handleStopCommand(interaction, guildId);
    } else if (command === 'skip') {
      await commandHandler.handleSkipCommand(interaction, guildId);
    } else if (command === 'queue') {
      await commandHandler.handleQueueCommand(interaction, guildId);
    } else if (command === 'nowplaying') {
      await commandHandler.handleNowPlayingCommand(interaction, guildId);
    } else if (command === 'loop') {
      const loopMode = interaction.options.getString('mode');
      await commandHandler.handleLoopCommand(interaction, guildId, loopMode);
    } else if (command === 'volume') {
      const volume = interaction.options.getInteger('volume');
      await commandHandler.handleVolumeCommand(interaction, guildId, volume);
    } else if (command === 'equalizer') {
      const preset = interaction.options.getString('preset');
      await commandHandler.handleEqualizerCommand(interaction, guildId, preset);
    } else if (command === 'search') {
      const query = interaction.options.getString('query');
      await commandHandler.handleSearchCommand(interaction, guildId, query);
    } else if (command === 'playlist') {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand === 'create') {
        const playlistName = interaction.options.getString('name');
        await commandHandler.handleCreatePlaylistCommand(interaction, userId, playlistName);
      } else if (subcommand === 'add') {
        const playlistName = interaction.options.getString('name');
        const songTitle = interaction.options.getString('song');
        await commandHandler.handleAddPlaylistCommand(interaction, userId, playlistName, songTitle);
      } else if (subcommand === 'remove') {
        const playlistName = interaction.options.getString('name');
        const songTitle = interaction.options.getString('song');
        await commandHandler.handleRemovePlaylistCommand(interaction, userId, playlistName, songTitle);
      } else if (subcommand === 'show') {
        const playlistName = interaction.options.getString('name');
        await commandHandler.handleShowPlaylistCommand(interaction, userId, playlistName);
      } else if (subcommand === 'play') {
        const playlistName = interaction.options.getString('name');
        await commandHandler.handlePlayPlaylistCommand(interaction, guildId, userId, playlistName);
      } else if (subcommand === 'delete') {
        const playlistName = interaction.options.getString('name');
        await commandHandler.handleDeletePlaylistCommand(interaction, userId, playlistName);
      }
    } else if (command === 'album') {
      const albumName = interaction.options.getString('name');
      const artistName = interaction.options.getString('artist');
      await commandHandler.handleAlbumCommand(interaction, guildId, albumName, artistName);
    } else if (command === 'shuffle') {
      await commandHandler.handleShuffleCommand(interaction, guildId);
    } else if (command === 'repeat') {
      const repeatMode = interaction.options.getString('mode');
      await commandHandler.handleRepeatCommand(interaction, guildId, repeatMode);
    } else if (command === 'premium') {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand === 'subscribe') {
        const plan = interaction.options.getString('plan');
        await commandHandler.handlePremiumSubscribeCommand(interaction, userId, plan);
      } else if (subcommand === 'unsubscribe') {
        await commandHandler.handlePremiumUnsubscribeCommand(interaction, userId);
      } else if (subcommand === 'info') {
        await commandHandler.handlePremiumInfoCommand(interaction, userId);
      }
    } else if (command === 'spotify') {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand === 'connect') {
        await commandHandler.handleSpotifyConnectCommand(interaction, userId);
      } else if (subcommand === 'disconnect') {
        await commandHandler.handleSpotifyDisconnectCommand(interaction, userId);
      } else if (subcommand === 'play') {
        const query = interaction.options.getString('query');
        await commandHandler.handleSpotifyPlayCommand(interaction, userId, query);
      }
    } else if (command === 'help') {
      await commandHandler.handleHelpCommand(interaction);
    } else if (command === 'settings') {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand === 'volume') {
        const volume = interaction.options.getInteger('volume');
        await commandHandler.handleSettingsVolumeCommand(interaction, userId, volume);
      } else if (subcommand === 'equalizer') {
        const preset = interaction.options.getString('preset');
        await commandHandler.handleSettingsEqualizerCommand(interaction, userId, preset);
      } else if (subcommand === 'theme') {
        const theme = interaction.options.getString('theme');
        await commandHandler.handleSettingsThemeCommand(interaction, userId, theme);
      }
    } else {
      // Handle unknown commands
      await interaction.reply({ content: 'Unknown command.', ephemeral: true });
    }
  } catch (error) {
    logger.error(error);
    const errorEmbed = new EmbedGenerator()
      .setTitle('Error')
      .setDescription('An error occurred while processing your request. Please try again later.')
      .setColor('0xFF0000');
    await interaction.reply({ embeds: [errorEmbed] });
  }
};