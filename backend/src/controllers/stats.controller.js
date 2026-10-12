
import { getStats } from '../services/streak.service.js';
import { getDailyProgress } from '../services/stats.service.js';
import { dailyQuerySchema } from '../schemas/stats.schema.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const stats = asyncHandler(async (req, res) => {
  res.json(await getStats(req.user.id));
});

export const daily = asyncHandler(async (req, res) => {
  const parsed = dailyQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validierungsfehler',
      details: parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  res.json(await getDailyProgress(req.user.id, parsed.data));
});
