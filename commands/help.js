const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get a list of available commands.'),
  async execute(interaction) {
    const embed = new EmbedGenerator()
      .setTitle('Music Bot Commands')
      .addFields(
        { name: 'Play', value: '`/play <song name/url/playlist>`' },
        { name: 'Pause', value: '`/pause`' },
        { name: 'Resume', value: '`/resume`' },
        { name: 'Stop', value: '`/stop`' },
        { name: 'Skip', value: '`/skip`' },
        { name: 'Queue', value: '`/queue`' },
        { name: 'Now Playing', value: '`/nowplaying`' },
        { name: 'Loop', value: '`/loop <song/queue>`' },
        { name: 'Volume', value: '`/volume <1-100>`' },
        { name: 'Equalizer', value: '`/equalizer <preset>`' },
        { name: 'Search', value: '`/search <query>`' },
        { name: 'Playlist', value: '`/playlist <action> <name/url>`' },
        { name: 'Album', value: '`/album <name/artist>`' },
        { name: 'Shuffle', value: '`/shuffle`' },
        { name: 'Repeat', value: '`/repeat <song/queue>`' },
        { name: 'Create Playlist', value: '`/createplaylist <name>`' },
        { name: 'Add to Playlist', value: '`/addplaylist <name> <song>`' },
        { name: 'Remove from Playlist', value: '`/removeplaylist <name> <song>`' },
        { name: 'Show Playlist', value: '`/showplaylist <name>`' },
        { name: 'Delete Playlist', value: '`/deleteplaylist <name>`' },
        { name: 'Spotify', value: '`/spotify <action>`' },
        { name: 'Premium', value: '`/premium <action>`' },
        { name: 'Settings', value: '`/settings <action>`' }
      )
      .setColor('0x0072ff');
    await interaction.reply({ embeds: [embed] });
  },
};