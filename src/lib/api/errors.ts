import { ApiError } from './http';

export interface ErrorDescription {
  status: number;
  message: string;
}

/**
 * Turns any failure into a status and a visitor-facing message.
 * Used on the server before an error crosses to the browser, so details that only
 * the API error carries (wait time, field errors) are folded into the message.
 */
export function describeApiError(e: unknown): ErrorDescription {
  if (!(e instanceof ApiError)) return { status: 500, message: 'Something went wrong.' };

  let message = e.message;
  const fieldMessages = Object.values(e.fieldErrors);
  if (fieldMessages.length) message = `${message}: ${fieldMessages.join('. ')}.`;
  if (e.status === 429 && e.retryAfterSeconds) {
    const minutes = Math.ceil(e.retryAfterSeconds / 60);
    message = `${message}. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
  }
  return { status: e.status === 0 ? 503 : e.status, message };
}

export interface InvalidFields {
  message: string;
  fieldErrors: Record<string, string>;
}

/**
 * A validation failure from the API (an error with per-field messages), or null.
 * Forms get these back as action data so each message shows under its field.
 */
export function invalidFields(e: unknown): InvalidFields | null {
  if (e instanceof ApiError && Object.keys(e.fieldErrors).length > 0) return { message: e.message, fieldErrors: e.fieldErrors };
  return null;
}
