import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import {
  app,
  prisma,
  resetDatabase,
  createUserAndLogin,
  authHeader,
  daysAgo,
} from './helpers.js';

const createHabit = async (token, name) =>
  (await request(app).post('/api/habits').set(authHeader(token)).send({ name })).body.id;

const checkIn = (token, habitId, date) =>
  request(app)
    .post(`/api/habits/${habitId}/checkins`)
    .set(authHeader(token))
    .send({ date });

describe('GET /api/stats', () => {
  let token;

  beforeEach(async () => {
    await resetDatabase();
    token = await createUserAndLogin();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('antwortet mit 401 ohne Token', async () => {
    const res = await request(app).get('/api/stats');

    expect(res.status).toBe(401);
  });

  it('liefert leere Werte ohne Habits', async () => {
    const res = await request(app).get('/api/stats').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ totalHabits: 0, totalCheckIns: 0, habits: [] });
  });

  it('berechnet Summen und Streaks pro Habit', async () => {
    const lesen = await createHabit(token, 'Lesen');
    const wasser = await createHabit(token, 'Wasser trinken');

    await checkIn(token, lesen, daysAgo(0));
    await checkIn(token, lesen, daysAgo(1));
    await checkIn(token, lesen, daysAgo(5));
    await checkIn(token, wasser, daysAgo(0));

    const res = await request(app).get('/api/stats').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.totalHabits).toBe(2);
    expect(res.body.totalCheckIns).toBe(4);
    expect(res.body.habits[0]).toMatchObject({
      name: 'Lesen',
      totalCheckIns: 3,
      currentStreak: 2,
      longestStreak: 2,
    });
    expect(res.body.habits[1]).toMatchObject({
      name: 'Wasser trinken',
      totalCheckIns: 1,
      currentStreak: 1,
      longestStreak: 1,
    });
  });

  it('zeigt nur die Daten des eigenen Nutzers', async () => {
    const habitId = await createHabit(token, 'Lesen');
    await checkIn(token, habitId, daysAgo(0));

    const tokenB = await createUserAndLogin('bernd@example.com', 'geheim1234');
    const res = await request(app).get('/api/stats').set(authHeader(tokenB));

    expect(res.body).toEqual({ totalHabits: 0, totalCheckIns: 0, habits: [] });
  });
});