const env = require('../config/env');

/**
 * Middleware that validates the x-admin-key header against the configured admin API key.
 * Returns 401 if the key is missing or invalid.
 */
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];

  if (!adminKey || adminKey !== env.adminApiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing admin key',
    });
  }

  next();
};

module.exports = adminAuth;
