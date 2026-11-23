import { useState, type FormEvent } from 'react';
import { actions } from 'astro:actions';
import { safeNext } from '../../lib/session/routes';
import { Field, Notice, fieldErrorsOf, messageOf } from './ui';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    setFields({});
    // The server action calls the API and stores the JWT in the session; the browser only receives the session cookie.
    const { error: failure } = mode === 'login' ? await actions.auth.login(form) : await actions.auth.register(form);
    if (failure) {
      setFields(fieldErrorsOf(failure));
      setError(messageOf(failure));
      setBusy(false);
      return;
    }
    window.location.assign(safeNext(new URLSearchParams(window.location.search).get('next')));
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
