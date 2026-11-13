export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors: Record<string, string> = {},
    readonly retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Query;
  body?: unknown;
}

export interface Http {
  request<T = unknown>(path: string, options?: RequestOptions): Promise<T>;
}

export interface HttpConfig {
  baseUrl: string;
  getToken: () => string | null;
  fetchImpl?: typeof fetch;
}

const FALLBACK_MESSAGES: Record<number, string> = {
  0: 'Could not reach Ganda. Check your connection and try again.',
  401: 'Your session has ended. Log in again.',
  403: 'You do not have access to this.',
  404: 'We could not find that.',
  409: 'That action conflicts with the current state. Refresh and try again.',
  429: 'Too many attempts. Wait a moment and try again.',
};

function buildUrl(baseUrl: string, path: string, query?: Query): string {
  const url = `${baseUrl.replace(/\/$/, '')}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function createHttp({ baseUrl, getToken, fetchImpl = fetch }: HttpConfig): Http {
  return {
    async request<T>(path: string, { method = 'GET', query, body }: RequestOptions = {}): Promise<T> {
      const headers: Record<string, string> = { Accept: 'application/json' };
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      if (body !== undefined) headers['Content-Type'] = 'application/json';

      let response: Response;
      try {
        response = await fetchImpl(buildUrl(baseUrl, path, query), {
          method,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body),
        });
      } catch {
        throw new ApiError(0, FALLBACK_MESSAGES[0]);
      }

      if (response.status === 204) return undefined as T;
      const data = await readJson(response);
      if (response.ok) return data as T;

      const payload = (data ?? {}) as { message?: string; error?: string; errors?: Record<string, string> };
      const retryAfter = Number(response.headers.get('Retry-After'));
      throw new ApiError(
        response.status,
        payload.message ?? payload.error ?? FALLBACK_MESSAGES[response.status] ?? 'Something went wrong.',
        payload.errors ?? {},
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null,
      );
    },
  };
}
