const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { queueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Loop the current song or the entire queue.')
    .addStringOption(option =>
      option
        .setName('mode')
        .setDescription('The loop mode to set.')
        .setRequired(true)
        .addChoices(
          { name: 'Off', value: 'off' },
          { name: 'Song', value: 'song' },
          { name: 'Queue', value: 'queue' },
        ),
    ),
  async execute(interaction) {
    const loopMode = interaction.options.getString('mode');
    const guildId = interaction.guild.id;

    try {
      const loopResult = await queueService.setLoopMode(guildId, loopMode);

      if (loopResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Loop Mode')
          .setDescription(`Loop mode set to ${loopMode.toUpperCase()}.`)
          .setColor('0x0072ff');
        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(loopResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while setting the loop mode. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};