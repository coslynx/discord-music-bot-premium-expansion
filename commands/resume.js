const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { queueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused music.'),
  async execute(interaction) {
    const guildId = interaction.guild.id;

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
};