import 'src/global.css';

// ----------------------------------------------------------------------

import type { Viewport } from 'next';

import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import { AppToaster } from 'src/theme/app-toaster';
import { QueryProvider } from 'src/providers/query-provider';
import { COLOR_MODE_STORAGE_KEY } from 'src/theme/constants';
import { AppThemeProvider } from 'src/theme/app-theme-provider';

import { AuthInitializer } from 'src/auth/auth-initializer';

// ----------------------------------------------------------------------

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdfdf8' },
    { media: '(prefers-color-scheme: dark)', color: '#12140f' },
  ],
};

export const metadata = {
  icons: [
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
  manifest: '/manifest.json',
};

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript
          attribute="data"
          defaultMode="system"
          modeStorageKey={COLOR_MODE_STORAGE_KEY}
        />
        <QueryProvider>
          <AuthInitializer>
            <AppThemeProvider>
              <AppToaster />
              {children}
            </AppThemeProvider>
          </AuthInitializer>
        </QueryProvider>
      </body>
    </html>
  );
}
