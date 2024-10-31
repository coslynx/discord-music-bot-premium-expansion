const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { spotifyHandler } = require('../utils/spotifyHandler');
const { queueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('album')
    .setDescription('Play songs from a specific album.')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('The name of the album to play.')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('artist')
        .setDescription('The artist of the album to play.')
        .setRequired(false),
    ),
  async execute(interaction) {
    const albumName = interaction.options.getString('name');
    const artistName = interaction.options.getString('artist');
    const guildId = interaction.guild.id;

    try {
      const albumResult = await spotifyHandler.getAlbum(albumName, artistName);

      if (albumResult.success) {
        const tracks = albumResult.data.tracks.items;
        const songUrls = tracks.map(track => track.external_urls.spotify);

        if (songUrls.length > 0) {
          const queueResult = await queueService.addSongs(guildId, songUrls);

          if (queueResult.success) {
            const embed = new EmbedGenerator()
              .setTitle(`Now playing: ${albumResult.data.name} by ${albumResult.data.artists[0].name}`)
              .setDescription(`Added ${tracks.length} songs from the album to the queue.`)
              .setColor('0x0072ff')
              .setImage(albumResult.data.images[0].url);

            await interaction.reply({ embeds: [embed] });
          } else {
            const errorEmbed = new EmbedGenerator()
              .setTitle('Error')
              .setDescription(queueResult.message)
              .setColor('0xFF0000');
            await interaction.reply({ embeds: [errorEmbed] });
          }
        } else {
          const errorEmbed = new EmbedGenerator()
            .setTitle('Error')
            .setDescription('No songs found in this album.')
            .setColor('0xFF0000');
          await interaction.reply({ embeds: [errorEmbed] });
        }
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(albumResult.message)
          .setColor('0xFF0000');
        await interaction.reply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while processing your request. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};