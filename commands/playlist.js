const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { playlistService } = require('../services/playlistService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Manage your music playlists.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new playlist.')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('The name of the playlist to create.')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a song to a playlist.')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('The name of the playlist to add the song to.')
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('song')
            .setDescription('The song to add to the playlist.')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a song from a playlist.')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('The name of the playlist to remove the song from.')
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('song')
            .setDescription('The song to remove from the playlist.')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('show')
        .setDescription('Show the songs in a specific playlist.')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('The name of the playlist to show.')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('play')
        .setDescription('Play a playlist.')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('The name of the playlist to play.')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Delete a playlist from your library.')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('The name of the playlist to delete.')
            .setRequired(true),
        ),
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    try {
      if (subcommand === 'create') {
        const playlistName = interaction.options.getString('name');

        const createResult = await playlistService.createPlaylist(userId, playlistName);

        if (createResult.success) {
          await interaction.reply({ content: `Playlist "${playlistName}" created successfully.` });
        } else {
          const errorEmbed = new EmbedGenerator()
            .setTitle('Error')
            .setDescription(createResult.message)
            .setColor('0xFF0000');
          await interaction.reply({ embeds: [errorEmbed] });
        }
      } else if (subcommand === 'add') {
        const playlistName = interaction.options.getString('name');
        const songTitle = interaction.options.getString('song');

        const addResult = await playlistService.addSongToPlaylist(userId, playlistName, songTitle);

        if (addResult.success) {
          await interaction.reply({ content: `Song "${songTitle}" added to playlist "${playlistName}" successfully.` });
        } else {
          const errorEmbed = new EmbedGenerator()
            .setTitle('Error')
            .setDescription(addResult.message)
            .setColor('0xFF0000');
          await interaction.reply({ embeds: [errorEmbed] });
        }
      } else if (subcommand === 'remove') {
        const playlistName = interaction.options.getString('name');
        const songTitle = interaction.options.getString('song');

        const removeResult = await playlistService.removeSongFromPlaylist(userId, playlistName, songTitle);

        if (removeResult.success) {
          await interaction.reply({ content: `Song "${songTitle}" removed from playlist "${playlistName}" successfully.` });
        } else {
          const errorEmbed = new EmbedGenerator()
            .setTitle('Error')
            .setDescription(removeResult.message)
            .setColor('0xFF0000');
          await interaction.reply({ embeds: [errorEmbed] });
        }
      } else if (subcommand === 'show') {
        const playlistName = interaction.options.getString('name');

        const playlist = await playlistService.getPlaylist(userId, playlistName);

        if (playlist.success) {
          if (playlist.data.songs.length > 0) {
            const embed = new EmbedGenerator()
              .setTitle(`Playlist: ${playlistName}`)
              .setDescription(playlist.data.songs.map((song, index) => `${index + 1}. ${song.title}`).join('\n'));

            await interaction.reply({ embeds: [embed] });
          } else {
            const embed = new EmbedGenerator()
              .setTitle(`Playlist: ${playlistName}`)
              .setDescription('This playlist is empty.');

            await interaction.reply({ embeds: [embed] });
          }
        } else {
          const errorEmbed = new EmbedGenerator()
            .setTitle('Error')
            .setDescription(playlist.message)
            .setColor('0xFF0000');
          await interaction.reply({ embeds: [errorEmbed] });
        }
      } else if (subcommand === 'play') {
        const playlistName = interaction.options.getString('name');
        const guildId = interaction.guild.id;

        const playlistResult = await playlistService.getPlaylist(userId, playlistName);

        if (playlistResult.success) {
          const songUrls = playlistResult.data.songs.map(song => song.url);
          const queueResult = await queueService.addSongs(guildId, songUrls);

          if (queueResult.success) {
            const embed = new EmbedGenerator()
              .setTitle(`Now playing: ${playlistName}`)
              .setDescription(`Added ${songUrls.length} songs from the playlist to the queue.`)
              .setColor('0x0072ff');
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
            .setDescription(playlistResult.message)
            .setColor('0xFF0000');
          await interaction.reply({ embeds: [errorEmbed] });
        }
      } else if (subcommand === 'delete') {
        const playlistName = interaction.options.getString('name');

        const deleteResult = await playlistService.deletePlaylist(userId, playlistName);

        if (deleteResult.success) {
          await interaction.reply({ content: `Playlist "${playlistName}" deleted successfully.` });
        } else {
          const errorEmbed = new EmbedGenerator()
            .setTitle('Error')
            .setDescription(deleteResult.message)
            .setColor('0xFF0000');
          await interaction.reply({ embeds: [errorEmbed] });
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