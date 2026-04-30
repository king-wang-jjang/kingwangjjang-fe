import { CONFIG } from 'src/config-global';

type RequestOptions = RequestInit & {
  skipJsonParse?: boolean;
};

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);
const LOCAL_AUTH_PREFIXES = ['/userservice/'];

function isLocalBrowserHost() {
  return typeof window !== 'undefined' && LOCAL_HOSTNAMES.has(window.location.hostname);
}

function resolveApiBaseUrl(path: string) {
  if (isLocalBrowserHost() && LOCAL_AUTH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return CONFIG.localServerUrl;
  }

  return CONFIG.serverUrl;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${resolveApiBaseUrl(path)}${path}`, {
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
