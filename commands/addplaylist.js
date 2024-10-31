const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { playlistService } = require('../services/playlistService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addplaylist')
    .setDescription('Add a song to a playlist.')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('The name of the playlist to add the song to.')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('song')
        .setDescription('The song to add to the playlist.')
        .setRequired(true),
    ),
  async execute(interaction) {
    const playlistName = interaction.options.getString('name');
    const songTitle = interaction.options.getString('song');
    const userId = interaction.user.id;

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
};