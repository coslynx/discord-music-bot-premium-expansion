const { logger } = require('./logger');

const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  const { method, url, headers } = req;
  const userAgent = headers['user-agent'];

  // Log request information
  logger.info(`[${method}] ${url} from ${userAgent}`);

  res.on('finish', () => {
    const end = Date.now();
    const duration = end - start;
    const { statusCode } = res;

    // Log response information
    logger.info(
      `[${method}] ${url} from ${userAgent} - status: ${statusCode} - duration: ${duration}ms`
    );
  });

  next();
};

module.exports = { loggingMiddleware };