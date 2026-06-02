'use client';

import { useMemo } from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
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
            main: '#1e1f23',
            light: '#4d4f46',
            dark: '#111827',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#F54E00',
            light: '#F7A501',
            dark: '#b17816',
            contrastText: '#ffffff',
          },
          error: {
            main: '#F54E00',
          },
          warning: {
            main: '#b17816',
          },
          success: {
            main: '#4d4f46',
          },
          background: {
            default: '#fdfdf8',
            paper: '#fdfdf8',
          },
          text: {
            primary: '#4d4f46',
            secondary: '#65675e',
          },
          divider: '#bfc1b7',
        },
        shape: {
          borderRadius: 4,
        },
        typography: {
          fontFamily:
            '"IBM Plex Sans Variable", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          h4: {
            color: '#23251d',
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1.2,
          },
          h5: {
            color: '#23251d',
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1.28,
          },
          h6: {
            color: '#23251d',
            fontWeight: 700,
            letterSpacing: 0,
            lineHeight: 1.4,
          },
          subtitle1: {
            fontWeight: 700,
            lineHeight: 1.4,
          },
          body1: {
            lineHeight: 1.56,
          },
          body2: {
            lineHeight: 1.6,
          },
          button: {
            fontWeight: 700,
            letterSpacing: 0,
            textTransform: 'none',
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: '#fdfdf8',
                color: '#4d4f46',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 4,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                  color: '#F54E00',
                },
                '&:active': {
                  transform: 'scale(0.99)',
                },
                '&.MuiButton-contained': {
                  backgroundColor: '#1e1f23',
                  color: '#ffffff',
                  borderRadius: 6,
                  '&:hover': {
                    backgroundColor: '#1e1f23',
                    color: '#F7A501',
                    opacity: 0.72,
                  },
                },
                '&.MuiButton-outlined': {
                  borderColor: '#bfc1b7',
                },
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
                borderRadius: 4,
                boxShadow: 'none',
                backgroundImage: 'none',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
              elevation8: {
                boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderColor: '#bfc1b7',
                borderRadius: 9999,
                fontWeight: 700,
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                borderRadius: 4,
                '&:hover': {
                  color: '#F54E00',
                  backgroundColor: '#f4f4f4',
                },
              },
            },
          },
          MuiTextField: {
            defaultProps: {
              size: 'small',
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                backgroundColor: '#eeefe9',
                borderRadius: 4,
                '& fieldset': {
                  borderColor: '#b6b7af',
                },
                '&:hover fieldset': {
                  borderColor: '#bfc1b7',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.25)',
                },
              },
            },
          },
          MuiSkeleton: {
            styleOverrides: {
              root: {
                backgroundColor: '#eeefe9',
              },
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
