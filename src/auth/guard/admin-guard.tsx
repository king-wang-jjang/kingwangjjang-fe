'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Box,
  Card,
  Stack,
  Alert,
  Button,
  Typography,
  CardContent,
  CircularProgress,
} from '@mui/material';

import { useAuthStore } from 'src/store/auth-store';

import { isAdmin } from 'src/auth/permissions';
import { recoverAuthSession } from 'src/auth/session-recovery';
import SocialLoginButtons from 'src/auth/components/form-oauth';

type Props = {
  children: React.ReactNode;
};

export function AdminGuard({ children }: Props) {
  const { user, login, logout, authStatus } = useAuthStore();

  useEffect(() => {
    if (authStatus !== 'authenticated') return undefined;

    let active = true;
    const refreshSession = async () => {
      const session = await recoverAuthSession();
      if (!active) return;

      if (session.status === 'authenticated') {
        login(session.user);
      } else if (session.status === 'unauthenticated') {
        logout();
      }
    };
    const interval = window.setInterval(refreshSession, 60_000);
    const refreshVisibleSession = () => {
      if (document.visibilityState === 'visible') {
        refreshSession();
      }
    };

    document.addEventListener('visibilitychange', refreshVisibleSession);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshVisibleSession);
    };
  }, [authStatus, login, logout]);

  if (authStatus === 'checking') {
    return (
      <Stack
        role="status"
        aria-live="polite"
        spacing={1.5}
        sx={{ minHeight: '55vh', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress size={28} aria-label="관리자 권한 확인 중" />
        <Typography variant="body2" color="text.secondary">
          관리자 권한을 확인하고 있습니다.
        </Typography>
      </Stack>
    );
  }

  if (authStatus === 'unauthenticated' || !user) {
    return (
      <GuardMessage
        title="로그인이 필요합니다"
        description="관리자 도구는 관리자 계정으로 로그인한 뒤 사용할 수 있습니다."
      >
        <SocialLoginButtons />
      </GuardMessage>
    );
  }

  if (!isAdmin(user)) {
    return (
      <GuardMessage
        title="접근 권한이 없습니다"
        description="이 경로는 관리자만 사용할 수 있습니다."
      >
        <Button component={Link} href="/board" variant="outlined" color="inherit">
          실시간 게시판으로 이동
        </Button>
      </GuardMessage>
    );
  }

  return children;
}

type GuardMessageProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function GuardMessage({ title, description, children }: GuardMessageProps) {
  return (
    <Box sx={{ width: 'min(100%, 560px)', mx: 'auto', py: { xs: 4, md: 8 } }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <LockOutlinedIcon color="action" />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {title}
              </Typography>
              <Alert severity="info" sx={{ mt: 1.5 }}>
                {description}
              </Alert>
            </Box>
            {children}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
