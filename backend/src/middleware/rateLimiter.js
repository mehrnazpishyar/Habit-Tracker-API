import rateLimit from 'express-rate-limit';

const message = { error: 'Zu viele Anfragen. Bitte später erneut versuchen.' };

const skipInTests = () => process.env.NODE_ENV === 'test';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message,
  skip: skipInTests,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message,
  skip: skipInTests,
});