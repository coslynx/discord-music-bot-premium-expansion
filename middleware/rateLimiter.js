const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
  points: 5, // How many points to start with
  duration: 1, // Number of seconds to ban for
});

module.exports = {
  rateLimiter,
};