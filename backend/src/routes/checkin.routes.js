import { Router } from 'express';
import { create, list, remove } from '../controllers/checkin.controller.js';
import { validate } from '../middleware/validate.js';
import { createCheckInSchema } from '../schemas/checkin.schema.js';

const router = Router({ mergeParams: true });

router.get('/', list);
router.post('/', validate(createCheckInSchema), create);
router.delete('/:checkInId', remove);

export default router;