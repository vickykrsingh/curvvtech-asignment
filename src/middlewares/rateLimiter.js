
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Custom key generator: use user id if authenticated, else use safe IP key
const getUserKey = (req) => {
  if (req.user && req.user.id) return req.user.id;
  return ipKeyGenerator(req);
};

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  keyGenerator: getUserKey,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

export default limiter;
