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
            main: '#00A76F',
            light: '#5BE49B',
            dark: '#007867',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#8E33FF',
            light: '#C684FF',
            dark: '#5119B7',
            contrastText: '#ffffff',
          },
          error: {
            main: '#FF5630',
          },
          warning: {
            main: '#FFAB00',
          },
          success: {
            main: '#22C55E',
          },
          background: {
            default: '#ffffff',
            paper: '#ffffff',
          },
          text: {
            primary: '#1C252E',
            secondary: '#637381',
          },
          divider: '#DFE3E8',
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
                borderColor: '#DFE3E8',
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
