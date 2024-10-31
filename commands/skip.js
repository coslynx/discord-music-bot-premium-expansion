const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { queueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song.'),
  async execute(interaction) {
    const guildId = interaction.guild.id;

    try {
      const skipResult = await queueService.skipSong(guildId);

      if (skipResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Skipped Song')
          .setDescription('The current song has been skipped.')
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(skipResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while skipping the song. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};