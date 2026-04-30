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
            main: '#F54E00',
            light: '#ff8a4c',
            dark: '#b63a00',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#4d4f46',
            light: '#7a7d73',
            dark: '#23251d',
            contrastText: '#fdfdf8',
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
            default: '#fdfdf8',
            paper: '#fdfdf8',
          },
          text: {
            primary: '#23251d',
            secondary: '#65675e',
          },
          divider: '#bfc1b7',
        },
        shape: {
          borderRadius: 6,
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
                borderRadius: 6,
              },
            },
          },
          MuiCard: {
            defaultProps: {
              variant: 'outlined',
            },
            styleOverrides: {
              root: {
                borderColor: '#bfc1b7',
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
