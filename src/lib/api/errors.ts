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
