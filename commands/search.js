const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { musicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for a song on YouTube.')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription('The song to search for.')
        .setRequired(true),
    ),
  async execute(interaction) {
    const query = interaction.options.getString('query');
    const guildId = interaction.guild.id;

    try {
      const searchResult = await musicService.search(query);

      if (searchResult.success) {
        if (searchResult.data.tracks.length > 0) {
          const embed = new EmbedGenerator()
            .setTitle('Search Results')
            .setDescription(searchResult.data.tracks.map((track, index) => `${index + 1}. ${track.info.title} - ${track.info.author}`).join('\n'))
            .setColor('0x0072ff');

          await interaction.reply({ embeds: [embed] });

          const filter = i => i.user.id === interaction.user.id && /^[1-9]$/.test(i.customId);

          const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

          collector.on('collect', async i => {
            const choice = parseInt(i.customId, 10);

            if (choice <= searchResult.data.tracks.length) {
              const selectedTrack = searchResult.data.tracks[choice - 1];
              const queueResult = await musicService.addToQueue(guildId, selectedTrack.track);

              if (queueResult.success) {
                await interaction.editReply({ content: `Added ${selectedTrack.info.title} to the queue.`, components: [] });
              } else {
                const errorEmbed = new EmbedGenerator()
                  .setTitle('Error')
                  .setDescription(queueResult.message)
                  .setColor('0xFF0000');

                await interaction.editReply({ embeds: [errorEmbed], components: [] });
              }
            } else {
              await i.reply({ content: 'Invalid choice. Please select a valid option.', ephemeral: true });
            }
          });

          collector.on('end', collected => {
            if (collected.size === 0) {
              interaction.editReply({ content: 'Search timed out. Please try again.', components: [] });
            }
          });
        } else {
          const errorEmbed = new EmbedGenerator()
            .setTitle('Error')
            .setDescription('No matching songs found.')
            .setColor('0xFF0000');

          await interaction.reply({ embeds: [errorEmbed] });
        }
      } else {
        const errorEmbed = new EmbedGenerator()
          .setTitle('Error')
          .setDescription(searchResult.message)
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