import { useState, type FormEvent } from 'react';
import { api, signIn } from '../../lib/session/session';
import { Field, Notice, fieldErrorsOf, messageOf } from './ui';

function safeNext(): string {
  const next = new URLSearchParams(window.location.search).get('next') ?? '/';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = (k: string) => String(form.get(k) ?? '').trim();
    setBusy(true);
    setError('');
    setFields({});
    try {
      const session =
        mode === 'login'
          ? await api.login(value('email'), String(form.get('password') ?? ''))
          : await api.register({
              email: value('email'),
              password: String(form.get('password') ?? ''),
              firstName: value('firstName'),
              lastName: value('lastName'),
              phone: value('phone') || undefined,
            });
      signIn(session);
      window.location.assign(safeNext());
    } catch (err) {
      setFields(fieldErrorsOf(err));
      setError(
        mode === 'login' && (err as { status?: number }).status === 401
          ? 'That email and password do not match an account.'
          : messageOf(err),
      );
      setBusy(false);
    }
  }

  const other = mode === 'login' ? '/register' : '/login';
  const nextQuery = typeof window === 'undefined' ? '' : window.location.search;

  return (
    <form className="auth" onSubmit={submit} noValidate>
      {error && <Notice tone="error">{error}</Notice>}
      {mode === 'register' && (
        <div className="auth__pair">
          <Field label="First name" error={fields.firstName}>
            <input className="input" name="firstName" autoComplete="given-name" required aria-invalid={!!fields.firstName} />
          </Field>
          <Field label="Last name" error={fields.lastName}>
            <input className="input" name="lastName" autoComplete="family-name" required aria-invalid={!!fields.lastName} />
          </Field>
        </div>
      )}
      <Field label="Email" error={fields.email}>
        <input className="input" name="email" type="email" autoComplete="email" required aria-invalid={!!fields.email} />
      </Field>
      <Field label="Password" error={fields.password} hint={mode === 'register' ? 'At least 8 characters.' : undefined}>
        <input
          className="input"
          name="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          minLength={mode === 'register' ? 8 : undefined}
          required
          aria-invalid={!!fields.password}
        />
      </Field>
      {mode === 'register' && (
        <Field label="Phone (optional)" error={fields.phone}>
          <input className="input" name="phone" type="tel" autoComplete="tel" />
        </Field>
      )}
      <button className="btn btn--act btn--block" disabled={busy}>
        {busy ? 'One moment…' : mode === 'login' ? 'Log in' : 'Create account'}
      </button>
      <p className="meta">
        {mode === 'login' ? 'New to Ganda? ' : 'Already have an account? '}
        <a href={`${other}${nextQuery}`}>{mode === 'login' ? 'Create an account' : 'Log in'}</a>
      </p>
      <style>{`
        .auth { display: grid; gap: 16px; }
        .auth__pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 420px) { .auth__pair { grid-template-columns: 1fr; } }
      `}</style>
    </form>
  );
}
