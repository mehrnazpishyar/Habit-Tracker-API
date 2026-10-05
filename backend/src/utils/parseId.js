import { HttpError } from './HttpError.js';

export function parseId(value, message = 'Nicht gefunden') {
  const id = Number(value);

  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    throw new HttpError(404, message);
  }

  return id;
}