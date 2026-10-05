
import { Router } from 'express';
import { stats } from '../controllers/stats.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', authenticate, stats);

export default router;