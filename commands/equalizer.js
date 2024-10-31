const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { musicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('equalizer')
    .setDescription('Adjust the equalizer settings.')
    .addStringOption(option =>
      option
        .setName('preset')
        .setDescription('Choose an equalizer preset.')
        .setRequired(true)
        .addChoices(
          { name: 'Flat', value: 'flat' },
          { name: 'Boost Bass', value: 'boostbass' },
          { name: 'Treble Boost', value: 'boosttreble' },
          { name: 'Classical', value: 'classical' },
          { name: 'Pop', value: 'pop' },
          { name: 'Rock', value: 'rock' },
        ),
    ),
  async execute(interaction) {
    const preset = interaction.options.getString('preset');
    const guildId = interaction.guild.id;

    try {
      const equalizerResult = await musicService.setEqualizer(guildId, preset);

      if (equalizerResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Equalizer')
          .setDescription(`Equalizer preset set to ${preset.toUpperCase()}.`)
          .setColor('0x0072ff');

        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(equalizerResult.message)
          .setColor('0xFF0000');

        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while setting the equalizer. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};