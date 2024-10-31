const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { queueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the currently playing music.'),
  async execute(interaction) {
    const guildId = interaction.guild.id;

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
};