import { resolveApiBaseUrl } from './api-base-url';

type RequestOptions = RequestInit & {
  skipJsonParse?: boolean;
  skipAuthRefresh?: boolean;
};

export type AuthRefreshResult = 'refreshed' | 'unauthenticated' | 'unavailable';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshPromise: Promise<AuthRefreshResult> | null = null;

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

export async function getAuthRefreshResult(): Promise<AuthRefreshResult> {
  if (refreshPromise) return refreshPromise;

  const pendingRefresh = request('/userservice/api/auth/refresh', {
    method: 'POST',
    skipAuthRefresh: true,
  })
    .then<AuthRefreshResult>((response) => {
      if (response.ok) return 'refreshed';
      if (response.status === 401 || response.status === 403) return 'unauthenticated';

      return 'unavailable';
    })
    .catch<AuthRefreshResult>(() => 'unavailable')
    .finally(() => {
      refreshPromise = null;
    });

  refreshPromise = pendingRefresh;
  return pendingRefresh;
}

export async function refreshAuthSession(): Promise<boolean> {
  return (await getAuthRefreshResult()) === 'refreshed';
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await request(path, options);

  if (response.status === 401 && !options.skipAuthRefresh && (await refreshAuthSession())) {
    response = await request(path, options);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, body || `Request failed with status ${response.status}`);
  }

  if (options.skipJsonParse) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
