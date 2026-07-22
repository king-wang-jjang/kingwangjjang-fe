import { resolveApiBaseUrl } from './api-base-url';

type RequestOptions = RequestInit & {
  skipJsonParse?: boolean;
  skipAuthRefresh?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

async function request(path: string, options: RequestOptions): Promise<Response> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${resolveApiBaseUrl()}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });
}

export async function refreshAuthSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = request('/userservice/api/auth/refresh', {
      method: 'POST',
      skipAuthRefresh: true,
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await request(path, options);

  if (response.status === 401 && !options.skipAuthRefresh && (await refreshAuthSession())) {
    response = await request(path, options);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with status ${response.status}`);
  }

  if (options.skipJsonParse) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
