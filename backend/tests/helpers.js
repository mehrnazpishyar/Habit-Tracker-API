
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/prisma.js';

export { app, prisma };

export async function resetDatabase() {
  await prisma.user.deleteMany();
}

export async function createUserAndLogin(
  email = 'anna@example.com',
  password = 'geheim1234',
) {
  await request(app).post('/api/auth/register').send({ email, password });
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export const daysAgo = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
};