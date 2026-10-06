const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

// LOGIN RATE LIMITER
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  statusCode: 429,
  standardHeaders: false,
  skip: (req, res) => {
    if (isDev) return true; // skip entirely in development
    return req.method !== 'POST';
  }
});

// API RATE LIMITER
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests, please try again later',
  statusCode: 429,
  standardHeaders: false,
  skip: (req, res) => isDev,
});

// REGISTER RATE LIMITER
exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many registration attempts, please try again later',
  statusCode: 429,
  standardHeaders: false,
  skip: (req, res) => isDev,
});

// PASSWORD RESET LIMITER
exports.passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts, please try again later',
  statusCode: 429,
  standardHeaders: false,
  skip: (req, res) => isDev,
});