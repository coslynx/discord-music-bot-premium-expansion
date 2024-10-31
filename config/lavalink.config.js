const {
  LAVALINK_HOST, LAVALINK_PORT, LAVALINK_PASSWORD,
} = process.env;

module.exports = {
  /
    The Lavalink server hostname.
   /
  host: LAVALINK_HOST,
  /
    The Lavalink server port.
   /
  port: LAVALINK_PORT,
  /
    The Lavalink server password.
   /
  password: LAVALINK_PASSWORD,
  /
    The Lavalink server connection timeout in milliseconds.
   /
  timeout: 5000,
  /
    The Lavalink server connection retry delay in milliseconds.
   /
  retryDelay: 1000,
  /
    The Lavalink server connection retry attempts.
   /
  retryAttempts: 10,
};