import request from 'supertest';
import app from '../src/app.js';

it('liefert 401 ohne Token', async () => {
  const res = await request(app).get('/api/habits');

  expect(res.status).toBe(401);
  expect(res.body).toEqual({ error: 'Nicht authentifiziert' });
});