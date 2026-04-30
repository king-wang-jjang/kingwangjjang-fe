'use client';

import Link from 'next/link';

import { Box, AppBar, Toolbar, Typography } from '@mui/material';

import { useAuthStore } from 'src/store/auth-store';

import SocialLoginButtons from 'src/auth/components/form-oauth';

type Props = {
  children: React.ReactNode;
};

export function AppShell({ children }: Props) {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          color: '#23251d',
          bgcolor: '#fdfdf8',
          borderBottom: '1px solid #bfc1b7',
          boxShadow: 'none',
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 58, md: 64 },
            px: { xs: 1.5, sm: 2, md: 4 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box
            component={Link}
            href="/board"
            aria-label="홈으로 이동"
            sx={{
              width: 38,
              height: 38,
              p: 0.35,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid #bfc1b7',
              borderRadius: '6px',
              bgcolor: '#fdfdf8',
              transition: 'border-color 160ms ease, transform 160ms ease',
              '&:hover': {
                borderColor: '#F54E00',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Box
              component="img"
              src="/favicon.svg"
              alt=""
              sx={{ width: '100%', height: '100%', display: 'block' }}
            />
          </Box>

          <Box sx={{ flexShrink: 0, ml: 'auto' }}>
            {isAuthenticated ? (
              <Typography variant="body2" fontWeight={800} sx={{ color: '#4d4f46' }}>
                {user?.nickname || '사용자'}
              </Typography>
            ) : (
              <SocialLoginButtons />
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          px: { xs: 1.5, sm: 2, md: 4 },
          py: { xs: 1.5, md: 2 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
