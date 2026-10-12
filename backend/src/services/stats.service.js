import prisma from '../lib/prisma.js';
import { lastDays } from '../utils/dates.js';

export async function getDailyProgress(userId, { days, to }) {
  const dates = lastDays(days, to);

  const habits = await prisma.habit.findMany({
    where: { userId },
    select: { id: true, createdAt: true },
  });

  const checkIns = await prisma.checkIn.findMany({
    where: {
      habit: { userId },
      date: {
        gte: new Date(`${dates[0]}T00:00:00.000Z`),
        lte: new Date(`${dates.at(-1)}T00:00:00.000Z`),
      },
    },
    select: { habitId: true, date: true },
  });

  const doneByDay = new Map();
  for (const checkIn of checkIns) {
    const key = checkIn.date.toISOString().slice(0, 10);
    if (!doneByDay.has(key)) doneByDay.set(key, new Set());
    doneByDay.get(key).add(checkIn.habitId);
  }

  const items = dates.map((date) => {
    const done = doneByDay.get(date) ?? new Set();
    const active = new Set(done);

    for (const habit of habits) {
      if (habit.createdAt.toISOString().slice(0, 10) <= date) {
        active.add(habit.id);
      }
    }

    const percent = active.size > 0 ? Math.round((done.size / active.size) * 100) : null;
    return { date, completed: done.size, total: active.size, percent };
  });

  const measured = items.filter((item) => item.percent !== null);
  const averagePercent = measured.length
    ? Math.round(measured.reduce((sum, item) => sum + item.percent, 0) / measured.length)
    : null;

  return { days, averagePercent, items };
}
