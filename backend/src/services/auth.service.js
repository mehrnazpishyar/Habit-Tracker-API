import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { HttpError } from '../utils/HttpError.js';

export async function registerUser({ email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new HttpError(409, 'E-Mail ist bereits registriert');
    }
    throw err;
  }
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user && (await bcrypt.compare(password, user.passwordHash));

  if (!valid) {
    throw new HttpError(401, 'E-Mail oder Passwort falsch');
  }

  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, createdAt: true },
  });

  if (!user) {
    throw new HttpError(401, 'Nicht authentifiziert');
  }

  return user;
}