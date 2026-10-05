
import { getStats } from '../services/streak.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const stats = asyncHandler(async (req, res) => {
  res.json(await getStats(req.user.id));
});
