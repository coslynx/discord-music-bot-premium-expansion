const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { musicService } = require('../services/musicService');
const { queueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or playlist.')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription('The song or playlist to play.')
        .setRequired(true),
    ),
  async execute(interaction) {
    const query = interaction.options.getString('query');
    const guildId = interaction.guild.id;

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
};