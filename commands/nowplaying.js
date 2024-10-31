const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { queueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Display information about the currently playing song.'),
  async execute(interaction) {
    const guildId = interaction.guild.id;

    try {
      const nowPlayingResult = await queueService.getNowPlaying(guildId);

      if (nowPlayingResult.success) {
        const embed = new EmbedGenerator()
          .setTitle('Now Playing')
          .setDescription(`${nowPlayingResult.data.title} by ${nowPlayingResult.data.artist}`)
          .setThumbnail(nowPlayingResult.data.thumbnail)
          .addFields(
            { name: 'Duration', value: `\`${nowPlayingResult.data.duration}\`` },
            { name: 'Progress', value: `\`${nowPlayingResult.data.progress}\`` },
            { name: 'Loop Mode', value: `\`${nowPlayingResult.data.loopMode}\`` },
          )
          .setColor('0x0072ff');

        await interaction.reply({ embeds: [embed] });
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(nowPlayingResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while getting the now playing information. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};