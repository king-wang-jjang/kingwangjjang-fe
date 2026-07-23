'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { Box, Chip, Stack, Button, Divider, Typography } from '@mui/material';

import { useBoard } from 'src/hooks/use-board';

import { useReadStore } from 'src/store/read-store';
import { useAuthStore } from 'src/store/auth-store';

function formatDateTime(value?: string) {
  if (!value) {
    return '예전 기록';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '예전 기록';
  }

  return date.toLocaleString('ko-KR');
}

export default function AccountHistoryPage() {
  const { isAuthenticated, user } = useAuthStore();
  const readEntries = useReadStore((state) => state.getReadEntries());
  const clearReadHistory = useReadStore((state) => state.clearReadHistory);
  const { postData } = useBoard();

  const recentReadPosts = useMemo(() => {
    const postById = new Map(postData.map((post) => [post.Id || `${post.site}-${post.no}`, post]));

    return readEntries.slice(0, 20).map((entry) => ({
      ...entry,
      post: postById.get(entry.boardId),
    }));
  }, [postData, readEntries]);

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
    <Box sx={{ maxWidth: 920, mx: 'auto', py: 4 }}>
      <Stack spacing={2}>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              계정 기록
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              이 브라우저에 저장된 읽은 글 기록입니다.
            </Typography>
          </Box>
          <Button
            color="inherit"
            variant="outlined"
            disabled={!readEntries.length}
            onClick={clearReadHistory}
          >
            기록 비우기
          </Button>
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
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                로그인 계정
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.authProvider} · {user.userId}
              </Typography>
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                최근 읽은 글
              </Typography>

              {!recentReadPosts.length && (
                <Typography variant="body2" color="text.secondary">
                  아직 이 브라우저에 저장된 읽은 글이 없습니다.
                </Typography>
              )}

              {recentReadPosts.map((entry) => (
                <Box
                  key={entry.boardId}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    p: 1.25,
                  }}
                >
                  <Stack spacing={0.75}>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      useFlexGap
                      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                      <Chip
                        size="small"
                        label={entry.post?.siteLabel || entry.boardId}
                        sx={{ bgcolor: 'background.muted', borderColor: 'divider' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(entry.readAt)}
                      </Typography>
                    </Stack>
                    {entry.post ? (
                      <Typography
                        component={Link}
                        href={entry.post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        sx={{
                          color: 'text.primary',
                          fontWeight: 750,
                          textDecoration: 'none',
                          overflowWrap: 'anywhere',
                          '&:hover': { color: 'secondary.main' },
                        }}
                      >
                        {entry.post.title}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        현재 목록에서 찾을 수 없는 게시글입니다.
                      </Typography>
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
