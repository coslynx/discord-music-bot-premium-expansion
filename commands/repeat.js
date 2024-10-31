const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { queueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('repeat')
    .setDescription('Repeat the current song or the entire queue.')
    .addStringOption(option =>
      option
        .setName('mode')
        .setDescription('The repeat mode to set.')
        .setRequired(true)
        .addChoices(
          { name: 'Off', value: 'off' },
          { name: 'Song', value: 'song' },
          { name: 'Queue', value: 'queue' },
        ),
    ),
  async execute(interaction) {
    const repeatMode = interaction.options.getString('mode');
    const guildId = interaction.guild.id;

    try {
      const repeatResult = await queueService.setRepeatMode(guildId, repeatMode);

      if (repeatResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Repeat Mode')
          .setDescription(`Repeat mode set to ${repeatMode.toUpperCase()}.`)
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(repeatResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while setting the repeat mode. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};