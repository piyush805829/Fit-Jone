const rateLimit = require('express-rate-limit');

const rateLimitMessage = {
  error: 'Too many requests',
  message: 'Please try again later',
};

/**
 * General rate limiter — 100 requests per 15 minutes per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
});

/**
 * Download rate limiter — 30 requests per 15 minutes per IP.
 * Stricter to prevent download abuse.
 */
const downloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
});

/**
 * Admin rate limiter — 50 requests per 15 minutes per IP.
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
});

module.exports = { generalLimiter, downloadLimiter, adminLimiter };
