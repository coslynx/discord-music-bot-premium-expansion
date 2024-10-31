const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { queueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current song queue.'),
  async execute(interaction) {
    const guildId = interaction.guild.id;

    try {
      const queueResult = await queueService.getQueue(guildId);

      if (queueResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Music Queue')
          .setDescription(queueResult.data.length > 0
            ? queueResult.data.map((song, index) => `${index + 1}. ${song.title}`).join('\n')
            : 'The queue is empty.'
          )
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(queueResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while getting the queue. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};