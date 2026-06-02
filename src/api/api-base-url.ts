import { CONFIG } from 'src/config-global';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);

function isPrivateIpv4Hostname(hostname: string) {
  if (hostname.startsWith('10.') || hostname.startsWith('192.168.')) {
    return true;
  }

  const match = hostname.match(/^172\.(\d{1,2})\./);
  if (!match) {
    return false;
  }

  const secondOctet = Number(match[1]);
  return secondOctet >= 16 && secondOctet <= 31;
}

export function isLocalBrowserHostname(hostname: string) {
  return LOCAL_HOSTNAMES.has(hostname) || isPrivateIpv4Hostname(hostname);
}

function localServerUrlForBrowserHost(browserHostname: string) {
  const parsed = new URL(CONFIG.localServerUrl);

  if (!LOCAL_HOSTNAMES.has(browserHostname)) {
    parsed.hostname = browserHostname;
  }

  return parsed.origin;
}

export function resolveApiBaseUrl() {
  if (typeof window === 'undefined') {
    return CONFIG.serverUrl;
  }

  const browserHostname = window.location.hostname;

  if (isLocalBrowserHostname(browserHostname)) {
    return localServerUrlForBrowserHost(browserHostname);
  }

  return CONFIG.serverUrl;
}
