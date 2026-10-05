import { z } from 'zod';

const color = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Farbe muss ein Hex-Wert wie #4F46E5 sein');

export const createHabitSchema = z.object({
  name: z.string().trim().min(1, 'Name ist erforderlich').max(100, 'Name darf höchstens 100 Zeichen lang sein'),
  description: z.string().trim().max(500, 'Beschreibung darf höchstens 500 Zeichen lang sein').optional(),
  color: color.optional(),
});

export const updateHabitSchema = createHabitSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Mindestens ein Feld ist erforderlich',
  });