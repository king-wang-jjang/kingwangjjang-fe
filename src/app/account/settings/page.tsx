'use client';

import type { UserType } from 'src/auth/types';

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';

import { Box, Alert, Stack, Avatar, Button, Divider, TextField, Typography } from '@mui/material';

import { updateMeProfile } from 'src/api/user-api';
import { useReadStore } from 'src/store/read-store';
import { useAuthStore } from 'src/store/auth-store';

function displayName(user: NonNullable<UserType>) {
  return user.displayName || user.nickname || `카카오 사용자 ${user.userId}`;
}

function formatDateTime(value?: string) {
  if (!value) {
    return '기록 없음';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '기록 없음';
  }

  return date.toLocaleString('ko-KR');
}

export default function AccountSettingsPage() {
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const readEntries = useReadStore((state) => state.getReadEntries());
  const [displayNameValue, setDisplayNameValue] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const latestReadAt = useMemo(() => readEntries[0]?.readAt, [readEntries]);

  useEffect(() => {
    setDisplayNameValue(user?.displayName || '');
  }, [user?.displayName]);

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const trimmedName = displayNameValue.trim();
      const updatedUser = await updateMeProfile(trimmedName || null);
      if (updatedUser) {
        updateUser(updatedUser);
        setDisplayNameValue(updatedUser.displayName || '');
      }
      setMessage(trimmedName ? '표시 이름을 저장했습니다.' : '표시 이름을 비웠습니다.');
    } catch (submitError: any) {
      setError(submitError.message || '표시 이름을 저장하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 920, mx: 'auto', py: 4 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            계정 설정
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            커뮤니티를 읽고 댓글을 남길 때 보이는 내 정보를 관리합니다.
          </Typography>
        </Box>

        <Box
          sx={{
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.subtle',
            borderRadius: 1,
            p: 2,
          }}
        >
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={user.profileImage || undefined}
                alt={name}
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 800,
                }}
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

            <Divider />

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={1.25}>
                <TextField
                  label="표시 이름"
                  value={displayNameValue}
                  onChange={(event) => setDisplayNameValue(event.target.value)}
                  helperText="비워두면 카카오 닉네임이 대신 표시됩니다. 최대 40자까지 저장할 수 있습니다."
                  slotProps={{ htmlInput: { maxLength: 40 } }}
                  fullWidth
                />

                {message && <Alert severity="success">{message}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained" disabled={saving}>
                    {saving ? '저장 중...' : '저장'}
                  </Button>
                </Box>
              </Stack>
            </Box>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                읽은 글
              </Typography>
              <Typography variant="body2" color="text.secondary">
                지금까지 {readEntries.length}개의 글을 읽었습니다.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                마지막으로 읽은 시간: {formatDateTime(latestReadAt)}
              </Typography>
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                카카오 프로필
              </Typography>
              <Typography variant="body2" color="text.secondary">
                닉네임: {user.nickname || '제공되지 않음'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                이미지: {user.profileImage || '카카오 프로필 이미지가 제공되지 않았습니다.'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                가입일: {formatDateTime(user.createTime)}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
