import { z } from 'zod';

const isoDateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid ISO 8601 date format',
});

const ianaTimezone = z.string().refine(
  (val) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: val });
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid IANA timezone' },
);

const baseUserSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.email({
    message: 'Invalid email format',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  }),
  birthday: isoDateString,
  timezone: ianaTimezone,
});

// create user
export const createUserSchema = baseUserSchema;
export type CreateUserDTO = z.infer<typeof createUserSchema>;

// update user
export const updateUserSchema = baseUserSchema.partial();
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
