const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { queueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the current music queue.'),
  async execute(interaction) {
    const guildId = interaction.guild.id;

    try {
      const shuffleResult = await queueService.shuffleQueue(guildId);

      if (shuffleResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Queue Shuffled')
          .setDescription('The music queue has been shuffled.')
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(shuffleResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while shuffling the queue. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};