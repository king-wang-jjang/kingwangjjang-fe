import { resolveApiBaseUrl } from './api-base-url';

type RequestOptions = RequestInit & {
  skipJsonParse?: boolean;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with status ${response.status}`);
  }

  if (options.skipJsonParse) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
