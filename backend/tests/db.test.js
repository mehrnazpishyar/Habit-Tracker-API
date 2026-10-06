import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import { prisma, resetDatabase } from './helpers.js';

describe('Testdatenbank', () => {
  beforeEach(resetDatabase);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('ist erreichbar und nach dem Zurücksetzen leer', async () => {
    expect(await prisma.user.count()).toBe(0);
    expect(await prisma.habit.count()).toBe(0);
    expect(await prisma.checkIn.count()).toBe(0);
  });
});