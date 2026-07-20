'use client';

import type { BoardPost } from 'src/api/board-api';

import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import {
  Box,
  Card,
  Alert,
  Stack,
  Button,
  Divider,
  Skeleton,
  Typography,
  CardContent,
  CircularProgress,
} from '@mui/material';

import { useTopBoards, TOP_BOARDS_LIMIT } from 'src/hooks/use-top-boards';

type Top10ListProps = {
  variant?: 'sidebar' | 'page';
};

function postKey(post: BoardPost) {
  return post.Id || `${post.site}-${post.no}`;
}

function Top10Skeleton() {
  return (
    <Stack aria-label="Top 10을 불러오는 중" spacing={0}>
      {Array.from({ length: TOP_BOARDS_LIMIT }).map((_, index) => (
        <Stack
          key={index}
          direction="row"
          spacing={1}
          sx={{
            minHeight: 54,
            px: 1.25,
            py: 1,
            alignItems: 'center',
            borderBottom: index === TOP_BOARDS_LIMIT - 1 ? 0 : 1,
            borderColor: '#d7d8d1',
          }}
        >
          <Skeleton variant="rounded" width={28} height={28} />
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            <Skeleton width={70} height={14} />
            <Skeleton width={index % 2 === 0 ? '88%' : '72%'} height={20} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

function Top10Row({
  post,
  rank,
  variant,
}: {
  post: BoardPost;
  rank: number;
  variant: 'sidebar' | 'page';
}) {
  const emphasized = rank <= 3;

  return (
    <Box component="li">
      <Box
        component="a"
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        title={post.title}
        aria-label={[`${rank}위`, post.title, '원문 새 탭에서 열기'].join(' ')}
        sx={{
          minHeight: variant === 'page' ? 68 : 56,
          px: variant === 'page' ? 1.75 : 1.25,
          py: variant === 'page' ? 1.25 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          borderBottom: 1,
          borderColor: '#d7d8d1',
          color: '#4d4f46',
          transition: 'background-color 120ms ease, color 120ms ease',
          '&:hover': {
            bgcolor: '#f4f4f4',
            color: '#F54E00',
          },
          '&:focus-visible': {
            outline: '3px solid rgba(59, 130, 246, 0.45)',
            outlineOffset: -3,
          },
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            width: 30,
            height: 30,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            borderRadius: 1,
            bgcolor: emphasized ? '#23251d' : '#e5e7e0',
            color: emphasized ? '#fdfdf8' : '#4d4f46',
            fontSize: '0.82rem',
            fontWeight: 800,
          }}
        >
          {rank}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            component="span"
            variant="caption"
            sx={{
              display: 'block',
              color: '#65675e',
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {post.siteLabel}
          </Typography>
          <Typography
            component="span"
            variant="body2"
            sx={{
              mt: 0.35,
              display: '-webkit-box',
              overflow: 'hidden',
              fontWeight: rank <= 3 ? 700 : 600,
              lineHeight: 1.35,
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
            }}
          >
            {post.title}
          </Typography>
        </Box>

        <OpenInNewRoundedIcon
          aria-hidden="true"
          sx={{ flexShrink: 0, color: '#9ea096', fontSize: 17 }}
        />
      </Box>
    </Box>
  );
}

export function Top10List({ variant = 'sidebar' }: Top10ListProps) {
  const { data: posts = [], isError, isPending, isFetching, refetch } = useTopBoards();
  const heading = variant === 'page' ? '일간 인기 순위' : '오늘의 TOP 10';

  return (
    <Card
      component="section"
      aria-labelledby={`top10-${variant}-title`}
      sx={{ overflow: 'hidden', bgcolor: '#fdfdf8', borderColor: '#bfc1b7' }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Stack
          direction="row"
          sx={{
            minHeight: 52,
            px: variant === 'page' ? 1.75 : 1.5,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            id={`top10-${variant}-title`}
            variant={variant === 'page' ? 'h6' : 'subtitle1'}
            sx={{ color: '#23251d', fontWeight: 800 }}
          >
            {heading}
          </Typography>
          {isFetching && !isPending && (
            <CircularProgress size={16} aria-label="Top 10 새로고침 중" />
          )}
        </Stack>
        <Divider />

        {isPending && <Top10Skeleton />}

        {isError && (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                다시 시도
              </Button>
            }
            sx={{ m: 1.25 }}
          >
            인기 순위를 불러오지 못했습니다.
          </Alert>
        )}

        {!isPending && !isError && !posts.length && (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              아직 집계된 인기 글이 없습니다.
            </Typography>
          </Box>
        )}

        {!isPending && !isError && !!posts.length && (
          <Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {posts.slice(0, TOP_BOARDS_LIMIT).map((post, index) => (
              <Top10Row
                key={postKey(post)}
                post={post}
                rank={index + 1}
                variant={variant}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
