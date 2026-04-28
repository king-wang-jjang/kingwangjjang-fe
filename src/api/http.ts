import { CONFIG } from 'src/config-global';

type RequestOptions = RequestInit & {
  skipJsonParse?: boolean;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${CONFIG.serverUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
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
