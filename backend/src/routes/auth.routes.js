
import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register',authLimiter, validate(registerSchema), register);
router.post('/login',authLimiter, validate(loginSchema), login);
router.get('/me', authenticate, me);

export default router;