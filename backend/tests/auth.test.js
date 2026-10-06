import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import {
  app,
  prisma,
  resetDatabase,
  createUserAndLogin,
  authHeader,
} from './helpers.js';

const credentials = { email: 'anna@example.com', password: 'geheim1234' };

describe('Auth', () => {
  beforeEach(resetDatabase);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('legt einen Nutzer an und gibt kein Passwort zurück', async () => {
      const res = await request(app).post('/api/auth/register').send(credentials);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: expect.any(Number), email: 'anna@example.com' });
      expect(res.body.passwordHash).toBeUndefined();
    });

    it('speichert das Passwort nur als bcrypt-Hash', async () => {
      await request(app).post('/api/auth/register').send(credentials);

      const user = await prisma.user.findUnique({ where: { email: credentials.email } });
      expect(user.passwordHash).not.toBe(credentials.password);
      expect(user.passwordHash.startsWith('$2')).toBe(true);
    });

    it('bereinigt die E-Mail-Adresse', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: '  Anna@Example.COM ', password: 'geheim1234' });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('anna@example.com');
    });

    it('antwortet mit 409, wenn die E-Mail schon registriert ist', async () => {
      await request(app).post('/api/auth/register').send(credentials);
      const res = await request(app).post('/api/auth/register').send(credentials);

      expect(res.status).toBe(409);
      expect(res.body).toEqual({ error: 'E-Mail ist bereits registriert' });
    });

    it('antwortet mit 400 bei ungültigen Eingaben', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'kaputt', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validierungsfehler');
      const fields = res.body.details.map((detail) => detail.field);
      expect(fields).toEqual(expect.arrayContaining(['email', 'password']));
    });

    it('antwortet mit 400, wenn der Body leer ist', async () => {
      const res = await request(app).post('/api/auth/register').send({});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(credentials);
    });

    it('gibt bei richtigen Daten ein Token zurück', async () => {
      const res = await request(app).post('/api/auth/login').send(credentials);

      expect(res.status).toBe(200);
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).toBeGreaterThan(20);
    });

    it('antwortet mit 401 bei falschem Passwort', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: credentials.email, password: 'falsch12345' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'E-Mail oder Passwort falsch' });
    });

    it('gibt bei unbekannter E-Mail dieselbe Antwort wie bei falschem Passwort', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'unbekannt@example.com', password: 'geheim1234' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'E-Mail oder Passwort falsch' });
    });

    it('antwortet mit 400, wenn das Passwort fehlt', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: credentials.email });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('antwortet mit 401 ohne Token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Nicht authentifiziert' });
    });

    it('antwortet mit 401 bei ungültigem Token', async () => {
      const res = await request(app).get('/api/auth/me').set(authHeader('kein-gueltiges-token'));

      expect(res.status).toBe(401);
    });

    it('antwortet mit 401 bei abgelaufenem Token', async () => {
      const expired = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: -10 });
      const res = await request(app).get('/api/auth/me').set(authHeader(expired));

      expect(res.status).toBe(401);
    });

    it('liefert mit gültigem Token die eigenen Daten', async () => {
      const token = await createUserAndLogin();
      const res = await request(app).get('/api/auth/me').set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('anna@example.com');
    });

    it('antwortet mit 401, wenn der Nutzer nicht mehr existiert', async () => {
      const token = await createUserAndLogin();
      await prisma.user.deleteMany();

      const res = await request(app).get('/api/auth/me').set(authHeader(token));

      expect(res.status).toBe(401);
    });
  });
});