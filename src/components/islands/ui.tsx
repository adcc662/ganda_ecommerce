import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { isActionError, isInputError } from 'astro:actions';
import { loginHref } from '../../lib/session/routes';

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'error' | 'ok'; children: ReactNode }) {
  const Icon = tone === 'error' ? AlertTriangle : tone === 'ok' ? CheckCircle2 : Info;
  return (
    <div className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={16} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error ? <em className="error">{error}</em> : hint ? <small>{hint}</small> : null}
    </label>
  );
}

/** Visitor-facing message. Action errors already carry it (wait times and API field errors are folded in on the server). */
export function messageOf(e: unknown): string {
  if (isInputError(e)) return 'Check the highlighted fields.';
  return e instanceof Error && e.message ? e.message : 'Something went wrong.';
}

/** For logged-in actions: an ended session sends the visitor to log in; otherwise returns the message to show. */
export function failureOf(e: unknown): string {
  if (isActionError(e) && e.code === 'UNAUTHORIZED') {
    window.location.assign(loginHref(window.location.pathname + window.location.search));
  }
  return messageOf(e);
}

/** One message per field: from an action's input validation, or from errors that carry `fieldErrors` (seller listings). */
export function fieldErrorsOf(e: unknown): Record<string, string> {
  if (isInputError(e)) {
    const fields: Record<string, string> = {};
    for (const [name, messages] of Object.entries(e.fields)) if (messages?.[0]) fields[name] = messages[0];
    return fields;
  }
  if (e && typeof e === 'object' && 'fieldErrors' in e) return (e as { fieldErrors: Record<string, string> }).fieldErrors;
  return {};
}

export function Loading({ lines = 3 }: { lines?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading" style={{ display: 'grid', gap: 12 }}>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton" style={{ height: 56 }} />
      ))}
    </div>
  );
}
