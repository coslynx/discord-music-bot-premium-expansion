const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { playlistService } = require('../services/playlistService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('showplaylist')
    .setDescription('Show the songs in a specific playlist.')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('The name of the playlist to show.')
        .setRequired(true),
    ),
  async execute(interaction) {
    const playlistName = interaction.options.getString('name');
    const userId = interaction.user.id;

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
};