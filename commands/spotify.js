const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { spotifyHandler } = require('../utils/spotifyHandler');
const { getUserData, updateUserSettings } = require('../services/userService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spotify')
    .setDescription('Manage your Spotify integration.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('connect')
        .setDescription('Connect your Spotify account.'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('disconnect')
        .setDescription('Disconnect your Spotify account.'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('play')
        .setDescription('Play a song or playlist from your Spotify library.')
        .addStringOption(option =>
          option
            .setName('query')
            .setDescription('Enter the name of a song or playlist.')
            .setRequired(true),
        ),
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    try {
      let userSettings = await getUserData(userId);

      if (subcommand === 'connect') {
        const authUrl = await spotifyHandler.getAuthUrl();
        await interaction.reply({ content: `Please authorize the bot to access your Spotify library: ${authUrl}` });
      } else if (subcommand === 'disconnect') {
        const disconnectResult = await spotifyHandler.disconnect(userId);

        if (disconnectResult.success) {
          userSettings = await getUserData(userId);
          await interaction.reply({ content: 'Your Spotify account has been disconnected.' });
        } else {
          await interaction.reply({ content: disconnectResult.message });
        }
      } else if (subcommand === 'play') {
        const query = interaction.options.getString('query');

        if (userSettings.spotify.connected) {
          const playResult = await spotifyHandler.play(userId, query);

          if (playResult.success) {
            await interaction.reply({ content: `Now playing: ${playResult.songInfo.name}` });
          } else {
            await interaction.reply({ content: playResult.message });
          }
        } else {
          const connectEmbed = new EmbedGenerator()
            .setTitle('Spotify Integration')
            .setDescription('Please connect your Spotify account first.')
            .setColor('0x0072ff');
          await interaction.reply({ embeds: [connectEmbed] });
        }
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