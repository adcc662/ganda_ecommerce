import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import { loginInput, registerInput } from '../src/lib/session/forms';

/**
 * Mirrors how Astro Actions read a form field (formDataToObject): an empty field becomes
 * `undefined` only when the field's top-level schema is `.optional()`, otherwise `null`.
 */
function fromForm(schema: z.ZodObject, form: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, field]) => [key, form[key] ? form[key] : field instanceof z.ZodOptional ? undefined : null]),
  );
}

const filled = { firstName: 'Ana', lastName: 'Q', email: 'a@b.co', password: 'longenough' };

describe('registerInput', () => {
  it('accepts a form with the optional phone left empty', () => {
    const parsed = registerInput.safeParse(fromForm(registerInput, { ...filled, phone: '' }));
    expect(parsed.success).toBe(true);
    expect(parsed.data?.phone).toBeUndefined();
  });

  it('keeps a phone number when given', () => {
    expect(registerInput.parse(fromForm(registerInput, { ...filled, phone: ' 555 ' })).phone).toBe('555');
  });

  it('shows the field copy for empty required fields', () => {
    const parsed = registerInput.safeParse(fromForm(registerInput, { ...filled, firstName: '' }));
    expect(parsed.error?.issues.map((i) => i.message)).toEqual(['Enter your first name.']);
  });
});

describe('loginInput', () => {
  it('shows the field copy for empty fields', () => {
    const parsed = loginInput.safeParse(fromForm(loginInput, {}));
    expect(parsed.error?.issues.map((i) => i.message)).toEqual(['Enter your email.', 'Enter your password.']);
  });
});
