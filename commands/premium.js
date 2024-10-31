const { SlashCommandBuilder } = require('discord.js');
const { EmbedGenerator } = require('../utils/embedGenerator');
const { premiumService } = require('../services/premiumService');
const { getUserData, updateUserSettings } = require('../services/userService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('premium')
    .setDescription('Manage your premium subscription.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('subscribe')
        .setDescription('Subscribe to a premium plan.')
        .addStringOption(option =>
          option
            .setName('plan')
            .setDescription('Choose a premium plan.')
            .setRequired(true)
            .addChoices(
              { name: 'Basic', value: 'basic' },
              { name: 'Pro', value: 'pro' },
              { name: 'Elite', value: 'elite' },
            ),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('unsubscribe')
        .setDescription('Unsubscribe from your premium plan.'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('View your premium subscription details.'),
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    try {
      let userSettings = await getUserData(userId);

      if (subcommand === 'subscribe') {
        const plan = interaction.options.getString('plan');

        const subscriptionResult = await premiumService.subscribe(userId, plan);

        if (subscriptionResult.success) {
          userSettings = await getUserData(userId);
          await interaction.reply({ content: `You have successfully subscribed to the ${userSettings.premium.plan} plan!` });
        } else {
          await interaction.reply({ content: subscriptionResult.message });
        }
      } else if (subcommand === 'unsubscribe') {
        const unsubscribeResult = await premiumService.unsubscribe(userId);

        if (unsubscribeResult.success) {
          userSettings = await getUserData(userId);
          await interaction.reply({ content: 'You have successfully unsubscribed from your premium plan.' });
        } else {
          await interaction.reply({ content: unsubscribeResult.message });
        }
      } else if (subcommand === 'info') {
        if (userSettings.premium) {
          const premiumEmbed = new EmbedGenerator()
            .setTitle('Premium Subscription')
            .addFields(
              { name: 'Plan', value: userSettings.premium.plan },
              { name: 'Status', value: userSettings.premium.active ? 'Active' : 'Inactive' },
              { name: 'Expires', value: userSettings.premium.expires ? userSettings.premium.expires.toLocaleDateString() : 'N/A' },
            )
            .setColor('0x0072ff');
          await interaction.reply({ embeds: [premiumEmbed] });
        } else {
          const noPremiumEmbed = new EmbedGenerator()
            .setTitle('Premium Subscription')
            .setDescription('You do not have an active premium subscription.')
            .setColor('0x0072ff');
          await interaction.reply({ embeds: [noPremiumEmbed] });
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