import * as checkInService from '../services/checkin.service.js';
import { checkInRangeSchema } from '../schemas/checkin.schema.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseId } from '../utils/parseId.js';

export const create = asyncHandler(async (req, res) => {
  const habitId = parseId(req.params.habitId, 'Habit nicht gefunden');
  const checkIn = await checkInService.createCheckIn(req.user.id, habitId, req.body.date);
  res.status(201).json(checkIn);
});

export const list = asyncHandler(async (req, res) => {
  const habitId = parseId(req.params.habitId, 'Habit nicht gefunden');

  const parsed = checkInRangeSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validierungsfehler',
      details: parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const items = await checkInService.listCheckIns(req.user.id, habitId, parsed.data);
  res.json(items);
});

export const remove = asyncHandler(async (req, res) => {
  const habitId = parseId(req.params.habitId, 'Habit nicht gefunden');
  const checkInId = parseId(req.params.checkInId, 'Check-in nicht gefunden');
  await checkInService.deleteCheckIn(req.user.id, habitId, checkInId);
  res.status(204).send();
});