import 'src/global.css';

// ----------------------------------------------------------------------

import type { Viewport } from 'next';

import { Toaster } from 'sonner';

import { AppThemeProvider } from 'src/theme/app-theme-provider';

import { AuthInitializer } from 'src/auth/auth-initializer';

// ----------------------------------------------------------------------

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fdfdf8',
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
    <html lang="ko">
      <body>
        <AuthInitializer>
          <AppThemeProvider>
            <Toaster richColors position="top-center" />
            {children}
          </AppThemeProvider>
        </AuthInitializer>
      </body>
    </html>
  );
}
