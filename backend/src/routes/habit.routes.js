import { Router } from 'express';
import { list, getOne, create, update, remove } from '../controllers/habit.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createHabitSchema, updateHabitSchema } from '../schemas/habit.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', list);
router.post('/', validate(createHabitSchema), create);
router.get('/:id', getOne);
router.patch('/:id', validate(updateHabitSchema), update);
router.delete('/:id', remove);

export default router;