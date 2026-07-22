import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { CONFIG } from 'src/config-global';

type SessionUser = {
  role?: string;
} | null;

export async function proxy(request: NextRequest) {
  const cookie = request.headers.get('cookie');
  const serverApiUrl = process.env.SERVER_API_URL || CONFIG.serverUrl;

  if (cookie) {
    try {
      const response = await fetch(new URL('/userservice/api/users/me', serverApiUrl), {
        headers: { accept: 'application/json', cookie },
        cache: 'no-store',
        signal: AbortSignal.timeout(5_000),
      });

      if (response.ok) {
        const user = (await response.json()) as SessionUser;
        if (user?.role === 'admin') {
          return NextResponse.next();
        }
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
