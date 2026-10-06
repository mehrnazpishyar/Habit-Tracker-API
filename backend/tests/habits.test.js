import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import {
  app,
  prisma,
  resetDatabase,
  createUserAndLogin,
  authHeader,
} from './helpers.js';

const today = () => new Date().toISOString().slice(0, 10);

const createHabit = (token, data = { name: '10 Minuten lesen' }) =>
  request(app).post('/api/habits').set(authHeader(token)).send(data);

describe('Habits', () => {
  let token;

  beforeEach(async () => {
    await resetDatabase();
    token = await createUserAndLogin();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/habits', () => {
    it('antwortet mit 401 ohne Token', async () => {
      const res = await request(app).post('/api/habits').send({ name: 'Lesen' });

      expect(res.status).toBe(401);
    });

    it('legt ein Habit mit Standardfarbe und Streak 0 an', async () => {
      const res = await createHabit(token);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(Number),
        name: '10 Minuten lesen',
        color: '#4F46E5',
        streak: 0,
        lastCheckIn: null,
      });
    });

    it('entfernt Leerzeichen um den Namen', async () => {
      const res = await createHabit(token, { name: '  Lesen  ' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Lesen');
    });

    it('antwortet mit 400 bei leerem Namen', async () => {
      const res = await createHabit(token, { name: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validierungsfehler');
    });

    it('antwortet mit 400 bei zu langem Namen', async () => {
      const res = await createHabit(token, { name: 'x'.repeat(101) });

      expect(res.status).toBe(400);
    });

    it('antwortet mit 400 bei ungültiger Farbe', async () => {
      const res = await createHabit(token, { name: 'Lesen', color: 'rot' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/habits', () => {
    it('liefert eine leere Liste', async () => {
      const res = await request(app).get('/api/habits').set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ items: [], total: 0, page: 1 });
    });

    it('paginiert die Ergebnisse', async () => {
      await createHabit(token, { name: 'Eins' });
      await createHabit(token, { name: 'Zwei' });
      await createHabit(token, { name: 'Drei' });

      const res = await request(app)
        .get('/api/habits?limit=2&page=2')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body).toMatchObject({ total: 3, totalPages: 2, page: 2, limit: 2 });
    });

    it('sucht unabhängig von Groß- und Kleinschreibung', async () => {
      await createHabit(token, { name: 'Lesen' });
      await createHabit(token, { name: 'Wasser trinken' });

      const res = await request(app)
        .get('/api/habits?search=LESEN')
        .set(authHeader(token));

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].name).toBe('Lesen');
    });

    it('begrenzt das Limit auf 50', async () => {
      const res = await request(app)
        .get('/api/habits?limit=1000')
        .set(authHeader(token));

      expect(res.body.limit).toBe(50);
    });

    it('fällt bei ungültiger Seite auf Seite 1 zurück', async () => {
      const res = await request(app).get('/api/habits?page=abc').set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(1);
    });
  });

  describe('GET /api/habits/:id', () => {
    it('liefert das Habit mit Streak', async () => {
      const created = await createHabit(token);
      const res = await request(app)
        .get(`/api/habits/${created.body.id}`)
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: '10 Minuten lesen', streak: 0 });
    });

    it('antwortet mit 404 bei unbekannter ID', async () => {
      const res = await request(app).get('/api/habits/999999').set(authHeader(token));

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Habit nicht gefunden' });
    });

    it('antwortet mit 404 bei ungültiger ID', async () => {
      const res = await request(app).get('/api/habits/abc').set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/habits/:id', () => {
    it('ändert den Namen', async () => {
      const created = await createHabit(token);
      const res = await request(app)
        .patch(`/api/habits/${created.body.id}`)
        .set(authHeader(token))
        .send({ name: '20 Minuten lesen' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('20 Minuten lesen');
    });

    it('antwortet mit 400 bei leerem Body', async () => {
      const created = await createHabit(token);
      const res = await request(app)
        .patch(`/api/habits/${created.body.id}`)
        .set(authHeader(token))
        .send({});

      expect(res.status).toBe(400);
    });

    it('antwortet mit 404 bei unbekannter ID', async () => {
      const res = await request(app)
        .patch('/api/habits/999999')
        .set(authHeader(token))
        .send({ name: 'Neu' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/habits/:id', () => {
    it('löscht das Habit', async () => {
      const created = await createHabit(token);
      const res = await request(app)
        .delete(`/api/habits/${created.body.id}`)
        .set(authHeader(token));

      expect(res.status).toBe(204);

      const after = await request(app)
        .get(`/api/habits/${created.body.id}`)
        .set(authHeader(token));
      expect(after.status).toBe(404);
    });

    it('löscht die Check-ins mit (Cascade)', async () => {
      const created = await createHabit(token);
      await request(app)
        .post(`/api/habits/${created.body.id}/checkins`)
        .set(authHeader(token))
        .send({ date: today() });
      expect(await prisma.checkIn.count()).toBe(1);

      await request(app)
        .delete(`/api/habits/${created.body.id}`)
        .set(authHeader(token));

      expect(await prisma.checkIn.count()).toBe(0);
    });

    it('antwortet mit 404 bei unbekannter ID', async () => {
      const res = await request(app).delete('/api/habits/999999').set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });

  describe('Besitzer-Prüfung', () => {
    let tokenB;
    let habitId;

    beforeEach(async () => {
      const created = await createHabit(token);
      habitId = created.body.id;
      tokenB = await createUserAndLogin('bernd@example.com', 'geheim1234');
    });

    it('zeigt Nutzer B das Habit von Nutzer A nicht', async () => {
      const res = await request(app).get(`/api/habits/${habitId}`).set(authHeader(tokenB));

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Habit nicht gefunden' });
    });

    it('liefert für Nutzer B nur die eigene (leere) Liste', async () => {
      const res = await request(app).get('/api/habits').set(authHeader(tokenB));

      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
      expect(res.body.total).toBe(0);
    });

    it('verhindert, dass Nutzer B das Habit ändert', async () => {
      const res = await request(app)
        .patch(`/api/habits/${habitId}`)
        .set(authHeader(tokenB))
        .send({ name: 'Gehackt' });

      expect(res.status).toBe(404);

      const original = await request(app)
        .get(`/api/habits/${habitId}`)
        .set(authHeader(token));
      expect(original.body.name).toBe('10 Minuten lesen');
    });

    it('verhindert, dass Nutzer B das Habit löscht', async () => {
      const res = await request(app)
        .delete(`/api/habits/${habitId}`)
        .set(authHeader(tokenB));

      expect(res.status).toBe(404);

      const original = await request(app)
        .get(`/api/habits/${habitId}`)
        .set(authHeader(token));
      expect(original.status).toBe(200);
    });

    it('antwortet bei fremden und unbekannten Habits gleich', async () => {
      const foreign = await request(app).get(`/api/habits/${habitId}`).set(authHeader(tokenB));
      const unknown = await request(app).get('/api/habits/999999').set(authHeader(tokenB));

      expect(foreign.status).toBe(unknown.status);
      expect(foreign.body).toEqual(unknown.body);
    });

    it('verhindert Zugriff von Nutzer B auf die Check-ins von Nutzer A', async () => {
      const checkIn = await request(app)
        .post(`/api/habits/${habitId}/checkins`)
        .set(authHeader(token))
        .send({ date: today() });

      const create = await request(app)
        .post(`/api/habits/${habitId}/checkins`)
        .set(authHeader(tokenB))
        .send({ date: today() });
      const list = await request(app)
        .get(`/api/habits/${habitId}/checkins`)
        .set(authHeader(tokenB));
      const remove = await request(app)
        .delete(`/api/habits/${habitId}/checkins/${checkIn.body.id}`)
        .set(authHeader(tokenB));

      expect(create.status).toBe(404);
      expect(list.status).toBe(404);
      expect(remove.status).toBe(404);
      expect(await prisma.checkIn.count()).toBe(1);
    });
  });
});