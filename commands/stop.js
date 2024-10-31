const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { queueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the music and clear the queue.'),
  async execute(interaction) {
    const guildId = interaction.guild.id;

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
};