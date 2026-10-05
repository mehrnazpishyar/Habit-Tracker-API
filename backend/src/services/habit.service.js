import prisma from '../lib/prisma.js';
import { HttpError } from '../utils/HttpError.js';

const habitSelect = {
  id: true,
  name: true,
  description: true,
  color: true,
  createdAt: true,
};

export async function listHabits(userId, { search, page, limit }) {
  const where = {
    userId,
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
  };

  const [items, total] = await Promise.all([
    prisma.habit.findMany({
      where,
      select: habitSelect,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.habit.count({ where }),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
}

export async function getHabit(userId, habitId) {
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    select: habitSelect,
  });

  if (!habit) {
    throw new HttpError(404, 'Habit nicht gefunden');
  }

  return habit;
}

export function createHabit(userId, data) {
  return prisma.habit.create({
    data: { ...data, userId },
    select: habitSelect,
  });
}

export async function updateHabit(userId, habitId, data) {
  const result = await prisma.habit.updateMany({
    where: { id: habitId, userId },
    data,
  });

  if (result.count === 0) {
    throw new HttpError(404, 'Habit nicht gefunden');
  }

  return getHabit(userId, habitId);
}

export async function deleteHabit(userId, habitId) {
  const result = await prisma.habit.deleteMany({
    where: { id: habitId, userId },
  });

  if (result.count === 0) {
    throw new HttpError(404, 'Habit nicht gefunden');
  }
}