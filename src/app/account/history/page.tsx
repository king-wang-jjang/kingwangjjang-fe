'use client';

import Link from 'next/link';

import { Box, Button, Divider, Typography } from '@mui/material';

import { useAuthStore } from 'src/store/auth-store';

export default function AccountHistoryPage() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', py: 4 }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 800 }}>
          로그인이 필요합니다
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          카카오 로그인 후 계정 기록을 확인할 수 있습니다.
        </Typography>
        <Button component={Link} href="/board" variant="contained">
          게시판으로 이동
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 800 }}>
        계정 기록
      </Typography>

      <Box
        sx={{
          border: 1,
          borderColor: '#bfc1b7',
          bgcolor: '#eeefe9',
          borderRadius: 1,
          p: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800 }}>
          로그인 계정
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user.authProvider} · {user.userId}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800 }}>
          최근 활동
        </Typography>
        <Typography variant="body2" color="text.secondary">
          아직 저장된 활동 기록이 없습니다.
        </Typography>
      </Box>
    </Box>
  );
}
