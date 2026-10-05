import prisma from '../lib/prisma.js';
import { HttpError } from '../utils/HttpError.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const toDateOnly = (value) => new Date(`${value}T00:00:00.000Z`);

const formatCheckIn = (checkIn) => ({
  id: checkIn.id,
  date: checkIn.date.toISOString().slice(0, 10),
  habitId: checkIn.habitId,
});

async function assertOwnsHabit(userId, habitId) {
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    select: { id: true },
  });

  if (!habit) {
    throw new HttpError(404, 'Habit nicht gefunden');
  }
}

export async function createCheckIn(userId, habitId, date) {
  await assertOwnsHabit(userId, habitId);

  const day = toDateOnly(date ?? new Date().toISOString().slice(0, 10));

  if (day.getTime() > Date.now() + DAY_MS) {
    throw new HttpError(400, 'Das Datum darf nicht in der Zukunft liegen');
  }

  try {
    const checkIn = await prisma.checkIn.create({ data: { habitId, date: day } });
    return formatCheckIn(checkIn);
  } catch (err) {
    if (err.code === 'P2002') {
      throw new HttpError(409, 'Für dieses Datum existiert bereits ein Check-in');
    }
    throw err;
  }
}

export async function listCheckIns(userId, habitId, { from, to }) {
  await assertOwnsHabit(userId, habitId);

  const where = { habitId };

  if (from || to) {
    where.date = {
      ...(from && { gte: toDateOnly(from) }),
      ...(to && { lte: toDateOnly(to) }),
    };
  }

  const items = await prisma.checkIn.findMany({
    where,
    orderBy: { date: 'desc' },
    take: 1000,
  });

  return items.map(formatCheckIn);
}

export async function deleteCheckIn(userId, habitId, checkInId) {
  const result = await prisma.checkIn.deleteMany({
    where: { id: checkInId, habitId, habit: { userId } },
  });

  if (result.count === 0) {
    throw new HttpError(404, 'Check-in nicht gefunden');
  }
}