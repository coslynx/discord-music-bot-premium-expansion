const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { playlistService } = require('../services/playlistService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeplaylist')
    .setDescription('Remove a song from a playlist.')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('The name of the playlist to remove the song from.')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('song')
        .setDescription('The song to remove from the playlist.')
        .setRequired(true),
    ),
  async execute(interaction) {
    const playlistName = interaction.options.getString('name');
    const songTitle = interaction.options.getString('song');
    const userId = interaction.user.id;

    try {
      const removeResult = await playlistService.removeSongFromPlaylist(userId, playlistName, songTitle);

      if (removeResult.success) {
        await interaction.reply({ content: `Song \"${songTitle}\" removed from playlist \"${playlistName}\" successfully.` });
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
};