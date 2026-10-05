import * as habitService from '../services/habit.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseId } from '../utils/parseId.js';

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;

  const result = await habitService.listHabits(req.user.id, { search, page, limit });
  res.json(result);
});

export const getOne = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'Habit nicht gefunden');
  res.json(await habitService.getHabit(req.user.id, id));
});

export const create = asyncHandler(async (req, res) => {
  const habit = await habitService.createHabit(req.user.id, req.body);
  res.status(201).json(habit);
});

export const update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'Habit nicht gefunden');
  res.json(await habitService.updateHabit(req.user.id, id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'Habit nicht gefunden');
  await habitService.deleteHabit(req.user.id, id);
  res.status(204).send();
});