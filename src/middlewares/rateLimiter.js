const rateLimit = require('express-rate-limit');

// Custom key generator to use user id from JWT if available
const getUserKey = (req) => {
  if (req.user && req.user.id) return req.user.id;
  // fallback to IP for unauthenticated routes
  return req.ip;
};

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  keyGenerator: getUserKey,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

module.exports = limiter;
