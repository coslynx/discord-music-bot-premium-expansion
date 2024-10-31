const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

module.exports = {
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/api/spotify/callback', // Adjust this based on your actual deployment environment
  scopes: [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-library-read',
    'playlist-read-private',
    'playlist-modify-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'user-top-read',
    'user-follow-read',
    'user-follow-modify',
    'user-library-modify',
    'user-read-recently-played',
  ],
};