import { z } from 'zod';

export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss das Format JJJJ-MM-TT haben')
  .refine((value) => {
    const d = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
  }, 'Ungültiges Datum');

export const createCheckInSchema = z.object({
  date: dateString.optional(),
});

export const checkInRangeSchema = z
  .object({
    from: dateString.optional(),
    to: dateString.optional(),
  })
  .refine((range) => !range.from || !range.to || range.from <= range.to, {
    message: '"from" darf nicht nach "to" liegen',
  });