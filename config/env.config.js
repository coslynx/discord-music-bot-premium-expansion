const {
  DISCORD_TOKEN,
  LAVALINK_HOST,
  LAVALINK_PORT,
  LAVALINK_PASSWORD,
  MONGO_URI,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  OPENAI_API_KEY,
  REDIS_URL,
} = process.env;

module.exports = {
  discord: {
    token: DISCORD_TOKEN,
  },
  lavalink: {
    host: LAVALINK_HOST,
    port: LAVALINK_PORT,
    password: LAVALINK_PASSWORD,
  },
  database: {
    mongo: {
      uri: MONGO_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      },
    },
    redis: {
      url: REDIS_URL,
    },
  },
  spotify: {
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
  },
  openai: {
    apiKey: OPENAI_API_KEY,
  },
};