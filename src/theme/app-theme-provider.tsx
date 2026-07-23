'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

import { COLOR_MODE_STORAGE_KEY } from './constants';

declare module '@mui/material/styles' {
  interface TypeBackground {
    subtle: string;
    muted: string;
    hover: string;
    read: string;
    raised: string;
    warm: string;
    soft: string;
  }
}

type Props = {
  children: React.ReactNode;
};

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data',
  },
  colorSchemes: {
    light: {
      palette: {
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
          subtle: '#eeefe9',
          muted: '#e5e7e0',
          hover: '#f4f4f4',
          read: '#f3f4ee',
          raised: '#fbfbf5',
          warm: '#f8f3ec',
          soft: '#f1f2ec',
        },
        text: {
          primary: '#23251d',
          secondary: '#65675e',
        },
        divider: '#bfc1b7',
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#eef0e8',
          light: '#ffffff',
          dark: '#c8ccc0',
          contrastText: '#171914',
        },
        secondary: {
          main: '#ff6b2b',
          light: '#ffae35',
          dark: '#d84909',
          contrastText: '#171914',
        },
        error: {
          main: '#ff6b4a',
        },
        warning: {
          main: '#e8a93a',
        },
        success: {
          main: '#aeb9a5',
        },
        background: {
          default: '#12140f',
          paper: '#1a1d17',
          subtle: '#22261e',
          muted: '#2c3128',
          hover: '#30352c',
          read: '#181b16',
          raised: '#20241d',
          warm: '#2a231d',
          soft: '#262a22',
        },
        text: {
          primary: '#eef0e8',
          secondary: '#afb3a7',
        },
        divider: '#44493f',
      },
    },
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily:
      '"IBM Plex Sans Variable", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      color: 'var(--mui-palette-text-primary)',
      fontWeight: 800,
      letterSpacing: 0,
      lineHeight: 1.2,
    },
    h5: {
      color: 'var(--mui-palette-text-primary)',
      fontWeight: 800,
      letterSpacing: 0,
      lineHeight: 1.28,
    },
    h6: {
      color: 'var(--mui-palette-text-primary)',
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
          backgroundColor: 'var(--mui-palette-background-default)',
          color: 'var(--mui-palette-text-primary)',
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
            color: 'var(--mui-palette-secondary-main)',
          },
          '&:active': {
            transform: 'scale(0.99)',
          },
          '&.MuiButton-contained': {
            backgroundColor: 'var(--mui-palette-primary-main)',
            color: 'var(--mui-palette-primary-contrastText)',
            borderRadius: 6,
            '&:hover': {
              backgroundColor: 'var(--mui-palette-primary-main)',
              color: 'var(--mui-palette-secondary-light)',
              opacity: 0.82,
            },
          },
          '&.MuiButton-outlined': {
            borderColor: 'var(--mui-palette-divider)',
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
          borderColor: 'var(--mui-palette-divider)',
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
          boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.35)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderColor: 'var(--mui-palette-divider)',
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
            color: 'var(--mui-palette-secondary-main)',
            backgroundColor: 'var(--mui-palette-background-hover)',
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
          backgroundColor: 'var(--mui-palette-background-subtle)',
          borderRadius: 4,
          '& fieldset': {
            borderColor: 'var(--mui-palette-divider)',
          },
          '&:hover fieldset': {
            borderColor: 'var(--mui-palette-text-secondary)',
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
          backgroundColor: 'var(--mui-palette-background-subtle)',
        },
      },
    },
  },
});

export function AppThemeProvider({ children }: Props) {
  return (
    <AppRouterCacheProvider options={{ key: 'kwj' }}>
      <MuiThemeProvider
        theme={theme}
        defaultMode="system"
        modeStorageKey={COLOR_MODE_STORAGE_KEY}
        disableTransitionOnChange
      >
        <CssBaseline enableColorScheme />
        {children}
      </MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}
