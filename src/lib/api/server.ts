import { catalogApi } from './client';
import { ApiError } from './http';

/** Server-side catalog loader: returns data or a visitor-facing failure message. */
export async function load<T>(fn: (api: ReturnType<typeof catalogApi>) => Promise<T>) {
  try {
    return { data: await fn(catalogApi()), error: null as ApiError | null };
  } catch (e) {
    const error = e instanceof ApiError ? e : new ApiError(500, 'Something went wrong loading the catalog.');
    return { data: null, error };
  }
}
