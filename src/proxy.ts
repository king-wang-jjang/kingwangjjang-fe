import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { CONFIG } from 'src/config-global';

type SessionUser = {
  role?: string;
} | null;

async function getSessionUser(serverApiUrl: string, cookie: string): Promise<SessionUser> {
  const response = await fetch(new URL('/userservice/api/users/me', serverApiUrl), {
    headers: { accept: 'application/json', cookie },
    cache: 'no-store',
    signal: AbortSignal.timeout(5_000),
  });

  return response.ok ? ((await response.json()) as SessionUser) : null;
}

function getSetCookieHeaders(headers: Headers): string[] {
  const {getSetCookie} = (headers as Headers & { getSetCookie?: () => string[] });
  if (getSetCookie) return getSetCookie.call(headers);

  const combined = headers.get('set-cookie');
  return combined ? combined.split(/,(?=\s*[^;,]+=)/) : [];
}

function mergeCookies(originalCookie: string, setCookieHeaders: string[]): string {
  const cookies = new Map(
    originalCookie.split(';').map((cookie) => {
      const [name, ...value] = cookie.trim().split('=');
      return [name, value.join('=')] as const;
    })
  );

  setCookieHeaders.forEach((header) => {
    const [cookie] = header.split(';');
    const [name, ...value] = cookie.trim().split('=');
    cookies.set(name, value.join('='));
  });

  return Array.from(cookies, ([name, value]) => `${name}=${value}`).join('; ');
}

export async function proxy(request: NextRequest) {
  const cookie = request.headers.get('cookie');
  const serverApiUrl = process.env.SERVER_API_URL || CONFIG.serverUrl;

  if (cookie) {
    try {
      let user = await getSessionUser(serverApiUrl, cookie);
      let refreshedCookies: string[] = [];

      if (!user) {
        const refreshResponse = await fetch(new URL('/userservice/api/auth/refresh', serverApiUrl), {
          method: 'POST',
          headers: { accept: 'application/json', cookie },
          cache: 'no-store',
          signal: AbortSignal.timeout(5_000),
        });

        if (refreshResponse.ok) {
          refreshedCookies = getSetCookieHeaders(refreshResponse.headers);
          user = await getSessionUser(serverApiUrl, mergeCookies(cookie, refreshedCookies));
        }
      }

      if (user?.role === 'admin') {
        const nextResponse = NextResponse.next();
        refreshedCookies.forEach((setCookie) => {
          nextResponse.headers.append('set-cookie', setCookie);
        });
        return nextResponse;
      }
    } catch {
      // Administrator routes fail closed when the auth service is unavailable.
    }
  }

  const redirectUrl = new URL('/board', request.url);
  redirectUrl.searchParams.set('adminAccess', 'denied');
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
