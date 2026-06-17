'use client';

import type { UserType } from 'src/auth/types';

import Link from 'next/link';

import { Box, Avatar, Button, Divider, Typography } from '@mui/material';

import { useAuthStore } from 'src/store/auth-store';

function displayName(user: NonNullable<UserType>) {
  return user.nickname || `카카오 사용자 ${user.userId}`;
}

export default function AccountSettingsPage() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', py: 4 }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 800 }}>
          로그인이 필요합니다
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          카카오 로그인 후 프로필 설정을 확인할 수 있습니다.
        </Typography>
        <Button component={Link} href="/board" variant="contained">
          게시판으로 이동
        </Button>
      </Box>
    );
  }

  const name = displayName(user);

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 800 }}>
        계정 설정
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={user.profileImage || undefined}
            alt={name}
            sx={{ width: 56, height: 56, bgcolor: '#23251d', fontWeight: 800 }}
          >
            {name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.authProvider} · {user.userId}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary">
          가입일
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, fontWeight: 700 }}>
          {new Date(user.createTime).toLocaleString('ko-KR')}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          프로필 이미지
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 700, wordBreak: 'break-all' }}>
          {user.profileImage || '카카오 프로필 이미지가 제공되지 않았습니다.'}
        </Typography>
      </Box>
    </Box>
  );
}
