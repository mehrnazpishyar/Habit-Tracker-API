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

const createHabit = (token, name = '10 Minuten lesen') =>
  request(app).post('/api/habits').set(authHeader(token)).send({ name });

const checkIn = (token, habitId, date) =>
  request(app)
    .post(`/api/habits/${habitId}/checkins`)
    .set(authHeader(token))
    .send(date ? { date } : {});

describe('Check-ins', () => {
  let token;
  let habitId;

  beforeEach(async () => {
    await resetDatabase();
    token = await createUserAndLogin();
    habitId = (await createHabit(token)).body.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/habits/:id/checkins', () => {
    it('antwortet mit 401 ohne Token', async () => {
      const res = await request(app)
        .post(`/api/habits/${habitId}/checkins`)
        .send({ date: daysAgo(0) });

      expect(res.status).toBe(401);
    });

    it('legt einen Check-in für das Datum an', async () => {
      const res = await checkIn(token, habitId, daysAgo(1));

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: expect.any(Number), date: daysAgo(1), habitId });
    });

    it('verwendet ohne Datum den heutigen Tag', async () => {
      const res = await checkIn(token, habitId);

      expect(res.status).toBe(201);
      expect(res.body.date).toBe(daysAgo(0));
    });

    it('antwortet mit 409 bei doppeltem Check-in am selben Tag', async () => {
      await checkIn(token, habitId, daysAgo(1));
      const res = await checkIn(token, habitId, daysAgo(1));

      expect(res.status).toBe(409);
      expect(res.body).toEqual({ error: 'Für dieses Datum existiert bereits ein Check-in' });
      expect(await prisma.checkIn.count()).toBe(1);
    });

    it('erlaubt dasselbe Datum bei einem anderen Habit', async () => {
      const otherId = (await createHabit(token, 'Wasser trinken')).body.id;
      await checkIn(token, habitId, daysAgo(1));
      const res = await checkIn(token, otherId, daysAgo(1));

      expect(res.status).toBe(201);
    });

    it('antwortet mit 400 bei falschem Datumsformat', async () => {
      const res = await checkIn(token, habitId, '05.10.2026');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validierungsfehler');
    });

    it('antwortet mit 400 bei nicht existierendem Datum', async () => {
      const res = await checkIn(token, habitId, '2026-02-31');

      expect(res.status).toBe(400);
    });

    it('antwortet mit 400 bei Datum weit in der Zukunft', async () => {
      const res = await checkIn(token, habitId, daysAgo(-2));

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Das Datum darf nicht in der Zukunft liegen' });
    });

    it('erlaubt morgen als Toleranz für Zeitzonen', async () => {
      const res = await checkIn(token, habitId, daysAgo(-1));

      expect(res.status).toBe(201);
    });

    it('antwortet mit 404 bei unbekanntem Habit', async () => {
      const res = await checkIn(token, 999999, daysAgo(0));

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Habit nicht gefunden' });
    });
  });

  describe('GET /api/habits/:id/checkins', () => {
    it('liefert eine leere Liste ohne Check-ins', async () => {
      const res = await request(app)
        .get(`/api/habits/${habitId}/checkins`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('sortiert mit dem neuesten Datum zuerst', async () => {
      await checkIn(token, habitId, daysAgo(2));
      await checkIn(token, habitId, daysAgo(0));
      await checkIn(token, habitId, daysAgo(1));

      const res = await request(app)
        .get(`/api/habits/${habitId}/checkins`)
        .set(authHeader(token));

      expect(res.body.map((item) => item.date)).toEqual([daysAgo(0), daysAgo(1), daysAgo(2)]);
    });

    it('filtert nach Zeitraum', async () => {
      await checkIn(token, habitId, daysAgo(5));
      await checkIn(token, habitId, daysAgo(2));
      await checkIn(token, habitId, daysAgo(0));

      const res = await request(app)
        .get(`/api/habits/${habitId}/checkins?from=${daysAgo(3)}&to=${daysAgo(1)}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.map((item) => item.date)).toEqual([daysAgo(2)]);
    });

    it('filtert nur mit from', async () => {
      await checkIn(token, habitId, daysAgo(5));
      await checkIn(token, habitId, daysAgo(0));

      const res = await request(app)
        .get(`/api/habits/${habitId}/checkins?from=${daysAgo(1)}`)
        .set(authHeader(token));

      expect(res.body).toHaveLength(1);
    });

    it('antwortet mit 400, wenn from nach to liegt', async () => {
      const res = await request(app)
        .get(`/api/habits/${habitId}/checkins?from=${daysAgo(0)}&to=${daysAgo(3)}`)
        .set(authHeader(token));

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validierungsfehler');
    });

    it('antwortet mit 400 bei ungültigem Datum im Filter', async () => {
      const res = await request(app)
        .get(`/api/habits/${habitId}/checkins?from=gestern`)
        .set(authHeader(token));

      expect(res.status).toBe(400);
    });

    it('antwortet mit 404 bei unbekanntem Habit', async () => {
      const res = await request(app).get('/api/habits/999999/checkins').set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/habits/:habitId/checkins/:id', () => {
    it('nimmt einen Check-in zurück', async () => {
      const created = await checkIn(token, habitId, daysAgo(0));
      const res = await request(app)
        .delete(`/api/habits/${habitId}/checkins/${created.body.id}`)
        .set(authHeader(token));

      expect(res.status).toBe(204);
      expect(await prisma.checkIn.count()).toBe(0);
    });

    it('antwortet beim zweiten Löschen mit 404', async () => {
      const created = await checkIn(token, habitId, daysAgo(0));
      const url = `/api/habits/${habitId}/checkins/${created.body.id}`;

      await request(app).delete(url).set(authHeader(token));
      const res = await request(app).delete(url).set(authHeader(token));

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Check-in nicht gefunden' });
    });

    it('löscht keinen Check-in über das falsche Habit', async () => {
      const otherId = (await createHabit(token, 'Wasser trinken')).body.id;
      const created = await checkIn(token, habitId, daysAgo(0));

      const res = await request(app)
        .delete(`/api/habits/${otherId}/checkins/${created.body.id}`)
        .set(authHeader(token));

      expect(res.status).toBe(404);
      expect(await prisma.checkIn.count()).toBe(1);
    });

    it('antwortet mit 404 bei ungültiger ID', async () => {
      const res = await request(app)
        .delete(`/api/habits/${habitId}/checkins/abc`)
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  describe('Streak im Habit', () => {
    const getHabit = () =>
      request(app).get(`/api/habits/${habitId}`).set(authHeader(token));

    it('zählt aufeinanderfolgende Tage bis heute', async () => {
      await checkIn(token, habitId, daysAgo(2));
      await checkIn(token, habitId, daysAgo(1));
      await checkIn(token, habitId, daysAgo(0));

      const res = await getHabit();

      expect(res.body.streak).toBe(3);
      expect(res.body.lastCheckIn).toBe(daysAgo(0));
    });

    it('bricht bei einer Lücke ab', async () => {
      await checkIn(token, habitId, daysAgo(3));
      await checkIn(token, habitId, daysAgo(0));

      const res = await getHabit();

      expect(res.body.streak).toBe(1);
    });

    it('hält die Streak mit einem Check-in von gestern am Leben', async () => {
      await checkIn(token, habitId, daysAgo(1));

      const res = await getHabit();

      expect(res.body.streak).toBe(1);
    });

    it('setzt die Streak auf 0, wenn der letzte Check-in zu alt ist', async () => {
      await checkIn(token, habitId, daysAgo(4));

      const res = await getHabit();

      expect(res.body.streak).toBe(0);
      expect(res.body.lastCheckIn).toBe(daysAgo(4));
    });

    it('verkürzt die Streak, wenn ein Check-in zurückgenommen wird', async () => {
      await checkIn(token, habitId, daysAgo(1));
      const today = await checkIn(token, habitId, daysAgo(0));
      await request(app)
        .delete(`/api/habits/${habitId}/checkins/${today.body.id}`)
        .set(authHeader(token));

      const res = await getHabit();

      expect(res.body.streak).toBe(1);
    });
  });
});