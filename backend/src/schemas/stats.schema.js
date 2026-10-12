import { z } from 'zod';
import { dateString } from './checkin.schema.js';

export const dailyQuerySchema = z.object({
  days: z.coerce
    .number()
    .int('days muss eine ganze Zahl sein')
    .min(1, 'days muss mindestens 1 sein')
    .max(90, 'days darf höchstens 90 sein')
    .default(7),
  to: dateString.optional(),
});