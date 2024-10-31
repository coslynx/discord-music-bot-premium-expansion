const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { musicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Adjust the music volume.')
    .addIntegerOption(option =>
      option
        .setName('volume')
        .setDescription('Volume level between 1 and 100.')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100),
    ),
  async execute(interaction) {
    const volume = interaction.options.getInteger('volume');
    const guildId = interaction.guild.id;

    try {
      const volumeResult = await musicService.setVolume(guildId, volume);

      if (volumeResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Volume')
          .setDescription(`Volume set to ${volume}%!`)
          .setColor('0x0072ff');

        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(volumeResult.message)
          .setColor('0xFF0000');

        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while setting the volume. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};