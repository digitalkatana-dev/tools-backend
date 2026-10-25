const rateLimit = require('express-rate-limit');

// --- IP-based limiters (protect against one source hammering many accounts) ---

const loginLimiterByIp = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { login: 'Too many login attempts. Please try again later.' },
});

const passwordResetLimiterByIp = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { reset: 'Too many reset attempts. Please try again later.' },
});

// --- Email-based limiters (protect one account from being targeted across IPs) ---

const loginLimiterByEmail = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // tighter than the IP limit — this account specifically is being hit
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.email?.toLowerCase()?.trim() || 'unknown',
  message: {
    login: 'Too many login attempts for this account. Please try again later.',
  },
});

const passwordResetLimiterByEmail = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.email?.toLowerCase()?.trim() || 'unknown',
  message: {
    reset: 'Too many reset requests for this account. Please try again later.',
  },
});

module.exports = {
  loginLimiter: [loginLimiterByIp, loginLimiterByEmail],
  passwordResetLimiter: [passwordResetLimiterByIp, passwordResetLimiterByEmail],
};
