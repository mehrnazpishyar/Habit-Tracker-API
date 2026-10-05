
import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/HttpError.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Nicht authentifiziert'));
  }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.user = { id: payload.userId };
    next();
  } catch {
    next(new HttpError(401, 'Nicht authentifiziert'));
  }
}