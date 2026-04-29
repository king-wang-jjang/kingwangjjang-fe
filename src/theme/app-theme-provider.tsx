'use client';

import { useMemo } from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

type Props = {
  children: React.ReactNode;
};

export function AppThemeProvider({ children }: Props) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: {
            main: '#2563eb',
            light: '#60a5fa',
            dark: '#1d4ed8',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#0f766e',
            light: '#2dd4bf',
            dark: '#115e59',
            contrastText: '#ffffff',
          },
          error: {
            main: '#dc2626',
          },
          warning: {
            main: '#d97706',
          },
          success: {
            main: '#16a34a',
          },
          background: {
            default: '#f6f8fb',
            paper: '#ffffff',
          },
          text: {
            primary: '#111827',
            secondary: '#5b6472',
          },
          divider: '#e5e7eb',
        },
        shape: {
          borderRadius: 8,
        },
        typography: {
          fontFamily:
            'Inter Variable, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          h4: {
            fontWeight: 750,
            letterSpacing: 0,
          },
          h5: {
            fontWeight: 750,
            letterSpacing: 0,
          },
          h6: {
            fontWeight: 700,
            letterSpacing: 0,
          },
          button: {
            fontWeight: 700,
            letterSpacing: 0,
            textTransform: 'none',
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
          MuiCard: {
            defaultProps: {
              variant: 'outlined',
            },
            styleOverrides: {
              root: {
                borderColor: '#e5e7eb',
                boxShadow: 'none',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiTextField: {
            defaultProps: {
              size: 'small',
            },
          },
        },
      }),
    []
  );

  return (
    <AppRouterCacheProvider options={{ key: 'kwj' }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}
