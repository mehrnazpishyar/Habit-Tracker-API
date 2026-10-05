import prisma from '../lib/prisma.js';
import { calculateStreak, calculateLongestStreak } from '../utils/streak.js';

const toKey = (date) => date.toISOString().slice(0, 10);

export async function getDatesByHabit(habitIds) {
  const datesByHabit = new Map();
  if (habitIds.length === 0) return datesByHabit;

  const rows = await prisma.checkIn.findMany({
    where: { habitId: { in: habitIds } },
    select: { habitId: true, date: true },
  });

  for (const row of rows) {
    if (!datesByHabit.has(row.habitId)) datesByHabit.set(row.habitId, []);
    datesByHabit.get(row.habitId).push(toKey(row.date));
  }
  return datesByHabit;
}

export async function getStats(userId) {
  const habits = await prisma.habit.findMany({
    where: { userId },
    select: { id: true, name: true, color: true },
    orderBy: { createdAt: 'asc' },
  });

  const datesByHabit = await getDatesByHabit(habits.map((habit) => habit.id));

  const items = habits.map((habit) => {
    const dates = datesByHabit.get(habit.id) ?? [];
    return {
      ...habit,
      totalCheckIns: dates.length,
      currentStreak: calculateStreak(dates),
      longestStreak: calculateLongestStreak(dates),
    };
  });

  return {
    totalHabits: items.length,
    totalCheckIns: items.reduce((sum, habit) => sum + habit.totalCheckIns, 0),
    habits: items,
  };
}
