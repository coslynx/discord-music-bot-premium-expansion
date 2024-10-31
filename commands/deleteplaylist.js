const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { playlistService } = require('../services/playlistService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deleteplaylist')
    .setDescription('Delete a playlist from your library.')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('The name of the playlist to delete.')
        .setRequired(true),
    ),
  async execute(interaction) {
    const playlistName = interaction.options.getString('name');
    const userId = interaction.user.id;

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
};