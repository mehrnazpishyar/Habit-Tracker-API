import prisma from '../lib/prisma.js';
import { HttpError } from '../utils/HttpError.js';
import { getDatesByHabit } from './streak.service.js';
import { calculateStreak } from '../utils/streak.js';

const habitSelect = {
  id: true,
  name: true,
  description: true,
  color: true,
  createdAt: true,
};

function withStreak(habit, dates = []) {
  return {
    ...habit,
    streak: calculateStreak(dates),
    lastCheckIn: dates.length ? [...dates].sort().at(-1) : null,
  };
}

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

    const datesByHabit = await getDatesByHabit(items.map((habit) => habit.id));


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

   const datesByHabit = await getDatesByHabit([habit.id]);
  return withStreak(habit, datesByHabit.get(habit.id));
}

export async function createHabit(userId, data) {
  const habit = await prisma.habit.create({
    data: { ...data, userId },
    select: habitSelect,
  });

  return withStreak(habit);
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

