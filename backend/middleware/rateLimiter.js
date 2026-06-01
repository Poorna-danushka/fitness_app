import rateLimit from 'express-rate-limit';
import { RATE_LIMIT } from '../constants/index.js';

/**
 * Global API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.API_WINDOW,
  max: RATE_LIMIT.API_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development',
});

/**
 * Auth endpoints rate limiter
 */
export const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.AUTH_WINDOW,
  max: RATE_LIMIT.AUTH_MAX_REQUESTS,
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    return req.body.email || req.ip;
  },
});

/**
 * Strict limiter for password reset and sensitive operations
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
