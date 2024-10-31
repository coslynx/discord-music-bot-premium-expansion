const { Client, IntentsBitField } = require('discord.js');
const { logger } = require('./utils/logger');
const { queueService } = require('./services/queueService');
const { musicService } = require('./services/musicService');
const { userService } = require('./services/userService');
const { premiumService } = require('./services/premiumService');
const { guildService } = require('./services/guildService');
require('dotenv').config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', async () => {
  try {
    // Log that the bot is ready
    logger.info(`Bot is ready as ${client.user.tag}!`);

    // Initialize database connections
    await userService.initialize();
    await guildService.initialize();
    await queueService.initialize();
    await premiumService.initialize();

    // Set bot activity
    client.user.setActivity('/help for commands');

    // Load commands from the commands directory
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(`./commands/${file}`);

      client.application.commands.create(command.data);
    }

    // Initialize Lavalink
    await musicService.initializeLavalink();
  } catch (error) {
    logger.error('Error in ready event handler:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);