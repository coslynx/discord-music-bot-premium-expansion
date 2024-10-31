const { SlashCommandBuilder } = require('discord.js');
const { getUserData, updateUserSettings } = require('../services/userService');
const { EmbedGenerator } = require('../utils/embedGenerator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Manage your bot settings.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('volume')
        .setDescription('Adjust your preferred volume level.')
        .addIntegerOption(option =>
          option.setName('volume')
            .setDescription('Volume level between 1 and 100.')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('equalizer')
        .setDescription('Customize the equalizer settings.')
        .addStringOption(option =>
          option.setName('preset')
            .setDescription('Choose an equalizer preset.')
            .setRequired(true)
            .addChoices(
              { name: 'Flat', value: 'flat' },
              { name: 'Boost Bass', value: 'boostbass' },
              { name: 'Treble Boost', value: 'boosttreble' },
              { name: 'Classical', value: 'classical' },
              { name: 'Pop', value: 'pop' },
              { name: 'Rock', value: 'rock' }
            )
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('theme')
        .setDescription('Change your preferred theme.')
        .addStringOption(option =>
          option.setName('theme')
            .setDescription('Select your desired theme.')
            .setRequired(true)
            .addChoices(
              { name: 'Dark Mode', value: 'dark' },
              { name: 'Light Mode', value: 'light' }
            )
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    try {
      let userSettings = await getUserData(userId);

      if (subcommand === 'volume') {
        const volume = interaction.options.getInteger('volume');
        userSettings.volume = volume;
        await updateUserSettings(userId, userSettings);
        await interaction.reply({ content: `Your preferred volume level has been set to ${volume}%!` });
      } else if (subcommand === 'equalizer') {
        const preset = interaction.options.getString('preset');
        userSettings.equalizer = preset;
        await updateUserSettings(userId, userSettings);
        await interaction.reply({ content: `Your equalizer preset has been set to ${preset}!` });
      } else if (subcommand === 'theme') {
        const theme = interaction.options.getString('theme');
        userSettings.theme = theme;
        await updateUserSettings(userId, userSettings);
        await interaction.reply({ content: `Your preferred theme has been set to ${theme} mode!` });
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedGenerator()
        .setTitle('Error')
        .setDescription('An error occurred while processing your request. Please try again later.');
      await interaction.reply({ embeds: [errorEmbed] });
    }
  }
};