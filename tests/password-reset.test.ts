import { describe, expect, it, vi } from 'vitest';
import { z } from 'astro/zod';
import { accountApi } from '@/lib/api/client';
import { createHttp } from '@/lib/api/http';
import { forgotPasswordInput, resetPasswordInput } from '@/lib/session/forms';

/** Mirrors Astro's form reading: empty fields are `undefined` for top-level `.optional()`, otherwise `null`. */
function fromForm(schema: z.ZodObject, form: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, field]) => [key, form[key] ? form[key] : field instanceof z.ZodOptional ? undefined : null]),
  );
}

describe('password reset API calls', () => {
  function apiWith(status: number) {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status }));
    return { api: accountApi(createHttp({ baseUrl: 'http://api', getToken: () => null, fetchImpl })), fetchImpl };
  }

  it('requests a reset link with the email', async () => {
    const { api, fetchImpl } = apiWith(202);
    await expect(api.forgotPassword('a@b.co')).resolves.toBeUndefined();
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('http://api/api/auth/forgot-password');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ email: 'a@b.co' });
  });

  it('sets the new password with the token from the link', async () => {
    const { api, fetchImpl } = apiWith(204);
    await expect(api.resetPassword('tok-1', 'newpassword1')).resolves.toBeUndefined();
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('http://api/api/auth/reset-password');
    expect(JSON.parse(init.body)).toEqual({ token: 'tok-1', newPassword: 'newpassword1' });
  });
});

describe('forgotPasswordInput', () => {
  it('trims the email', () => {
    expect(forgotPasswordInput.parse(fromForm(forgotPasswordInput, { email: ' a@b.co ' }))).toEqual({ email: 'a@b.co' });
  });

  it('asks for the email when it is empty', () => {
    const parsed = forgotPasswordInput.safeParse(fromForm(forgotPasswordInput, {}));
    expect(parsed.error?.issues.map((i) => i.message)).toEqual(['Enter your email.']);
  });
});

describe('resetPasswordInput', () => {
  it('keeps the token and the new password as typed', () => {
    expect(resetPasswordInput.parse(fromForm(resetPasswordInput, { token: 'tok-1', newPassword: ' spaced pass ' }))).toEqual({
      token: 'tok-1',
      newPassword: ' spaced pass ',
    });
  });

  it('asks for the new password when it is empty', () => {
    const parsed = resetPasswordInput.safeParse(fromForm(resetPasswordInput, { token: 'tok-1' }));
    expect(parsed.error?.issues.map((i) => i.message)).toEqual(['Choose a new password.']);
  });

  it('rejects a form without the token from the link', () => {
    const parsed = resetPasswordInput.safeParse(fromForm(resetPasswordInput, { newPassword: 'newpassword1' }));
    expect(parsed.error?.issues.map((i) => i.message)).toEqual(['This reset link is incomplete. Request a new one.']);
  });
});
