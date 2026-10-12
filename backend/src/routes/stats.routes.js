
import { Router } from 'express';
import { stats , daily } from '../controllers/stats.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', authenticate, stats);
router.get('/daily', authenticate, daily);

export default router;