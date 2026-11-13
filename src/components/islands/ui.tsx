import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { ApiError } from '../../lib/api/http';

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

export function messageOf(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 429 && e.retryAfterSeconds) {
      const minutes = Math.ceil(e.retryAfterSeconds / 60);
      return `${e.message}. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
    }
    return e.message;
  }
  return e instanceof Error ? e.message : 'Something went wrong.';
}

export function fieldErrorsOf(e: unknown): Record<string, string> {
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
