import { z } from 'astro/zod';

/**
 * Inputs of the login and register actions (accept: 'form').
 * Astro reads an empty form field as `undefined` only when the field's top-level schema is
 * `.optional()`, otherwise as `null`. So optional fields stay plain `.optional()`, and required
 * fields give their own copy for a missing value (`error`) as well as for a blank one (`min`).
 */
const text = (message: string) => z.string({ error: message }).trim().min(1, message);

export const loginInput = z.object({
  email: text('Enter your email.'),
  password: z.string({ error: 'Enter your password.' }).min(1, 'Enter your password.'),
});

export const registerInput = z.object({
  firstName: text('Enter your first name.'),
  lastName: text('Enter your last name.'),
  email: text('Enter your email.'),
  password: z.string({ error: 'Choose a password.' }).min(1, 'Choose a password.'),
  phone: z.string().trim().optional(),
});
