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

const getDaily = (token, query = '') =>
  request(app).get(`/api/stats/daily${query}`).set(authHeader(token));

describe('GET /api/stats/daily', () => {
  let token;

  beforeEach(async () => {
    await resetDatabase();
    token = await createUserAndLogin();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('antwortet mit 401 ohne Token', async () => {
    const res = await request(app).get('/api/stats/daily');

    expect(res.status).toBe(401);
  });

  it('liefert sieben Tage ohne Prozentwert, wenn es keine Habits gibt', async () => {
    const res = await getDaily(token);

    expect(res.status).toBe(200);
    expect(res.body.days).toBe(7);
    expect(res.body.averagePercent).toBeNull();
    expect(res.body.items).toHaveLength(7);
    expect(res.body.items.at(-1)).toEqual({
      date: daysAgo(0),
      completed: 0,
      total: 0,
      percent: null,
    });
  });

  it('berechnet den Tagesfortschritt in Prozent', async () => {
    const lesen = await createHabit(token, 'Lesen');
    const wasser = await createHabit(token, 'Wasser trinken');

    await checkIn(token, lesen, daysAgo(0));
    let res = await getDaily(token);
    expect(res.body.items.at(-1)).toEqual({
      date: daysAgo(0),
      completed: 1,
      total: 2,
      percent: 50,
    });

    await checkIn(token, wasser, daysAgo(0));
    res = await getDaily(token);
    expect(res.body.items.at(-1).percent).toBe(100);
  });

  it('zählt Habits erst ab ihrem Erstellungstag und mittelt nur gemessene Tage', async () => {
    const lesen = await createHabit(token, 'Lesen');
    await createHabit(token, 'Wasser trinken');
    await checkIn(token, lesen, daysAgo(2));

    const res = await getDaily(token);
    const byDate = Object.fromEntries(res.body.items.map((item) => [item.date, item]));

    expect(byDate[daysAgo(2)]).toEqual({
      date: daysAgo(2),
      completed: 1,
      total: 1,
      percent: 100,
    });
    expect(byDate[daysAgo(1)].percent).toBeNull();
    expect(byDate[daysAgo(0)].percent).toBe(0);
    expect(res.body.averagePercent).toBe(50);
  });

  it('berücksichtigt die Parameter days und to', async () => {
    const res = await getDaily(token, `?days=3&to=${daysAgo(3)}`);

    expect(res.status).toBe(200);
    expect(res.body.items.map((item) => item.date)).toEqual([
      daysAgo(5),
      daysAgo(4),
      daysAgo(3),
    ]);
  });

  it.each([['?days=0'], ['?days=91'], ['?days=abc'], ['?to=gestern']])(
    'antwortet mit 400 bei ungültigem Parameter %s',
    async (query) => {
      const res = await getDaily(token, query);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validierungsfehler');
    },
  );

  it('zeigt nur die Daten des eigenen Nutzers', async () => {
    const lesen = await createHabit(token, 'Lesen');
    await checkIn(token, lesen, daysAgo(0));

    const tokenB = await createUserAndLogin('bernd@example.com', 'geheim1234');
    const res = await getDaily(tokenB);

    expect(res.body.averagePercent).toBeNull();
    expect(res.body.items.every((item) => item.total === 0)).toBe(true);
  });
});