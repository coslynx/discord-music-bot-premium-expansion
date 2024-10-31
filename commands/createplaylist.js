const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { playlistService } = require('../services/playlistService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createplaylist')
    .setDescription('Create a new playlist.')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('The name of the playlist to create.')
        .setRequired(true),
    ),
  async execute(interaction) {
    const playlistName = interaction.options.getString('name');
    const userId = interaction.user.id;

    try {
      const createResult = await playlistService.createPlaylist(userId, playlistName);

      if (createResult.success) {
        await interaction.reply({ content: `Playlist \"${playlistName}\" created successfully.` });
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
};