'use client';

import type { BoardPost, BoardAnalysisJobStatus } from 'src/api/board-api';

import Link from 'next/link';
import { useId, useRef, useState, useEffect } from 'react';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import {
  Box,
  Card,
  Alert,
  Stack,
  Button,
  Tooltip,
  Divider,
  Collapse,
  Skeleton,
  ButtonBase,
  IconButton,
  Typography,
  CardContent,
  CircularProgress,
} from '@mui/material';

import { useTopBoardAnalysis } from 'src/hooks/use-top-board-analysis';
import { useTopBoards, TOP_BOARDS_LIMIT, TOP_BOARDS_TODAY } from 'src/hooks/use-top-boards';

import { CommentDrawer } from 'src/components/comment';
import { getPostSummary, resolveThumbnailSrc } from 'src/components/board-post/board-post-utils';

type Top10CommentTarget = {
  postId: string;
  site: string;
} | null;

type Top10ListProps = {
  variant?: 'sidebar' | 'page';
  selectedDate?: string;
  initialExpandedRank?: number;
};

const HISTORY_DATE_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'short',
  timeZone: 'Asia/Seoul',
});

function formatHistoryDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00+09:00`);

  return Number.isNaN(parsedDate.getTime()) ? date : HISTORY_DATE_FORMATTER.format(parsedDate);
}

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
            borderColor: 'divider',
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

function Top10Rank({ rank }: { rank: number }) {
  const emphasized = rank <= 3;

  return (
    <Box
      aria-hidden="true"
      sx={{
        width: 30,
        height: 30,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        borderRadius: 1,
        bgcolor: emphasized ? 'primary.main' : 'background.muted',
        color: emphasized ? 'primary.contrastText' : 'text.primary',
        fontSize: '0.82rem',
        fontWeight: 800,
      }}
    >
      {rank}
    </Box>
  );
}

function Top10SidebarRow({ post, rank }: { post: BoardPost; rank: number }) {
  return (
    <Box component="li">
      <Box
        component={Link}
        href={`/top10/?rank=${rank}`}
        title={post.title}
        aria-label={[`${rank}위`, post.title, 'Top 10 상세 보기'].join(' ')}
        sx={{
          minHeight: 56,
          px: 1.25,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          borderBottom: 1,
          borderColor: 'divider',
          color: 'text.primary',
          transition: 'background-color 120ms ease, color 120ms ease',
          '&:hover': {
            bgcolor: 'background.hover',
            color: 'secondary.main',
          },
          '&:focus-visible': {
            outline: '3px solid rgba(59, 130, 246, 0.45)',
            outlineOffset: -3,
          },
        }}
      >
        <Top10Rank rank={rank} />

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            component="span"
            variant="caption"
            sx={{
              display: 'block',
              color: 'text.secondary',
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

        <ChevronRightRoundedIcon
          aria-hidden="true"
          sx={{ flexShrink: 0, color: 'text.disabled', fontSize: 17 }}
        />
      </Box>
    </Box>
  );
}

type Top10PageRowProps = {
  post: BoardPost;
  rank: number;
  expanded: boolean;
  isToday: boolean;
  isAuthenticated: boolean;
  analysisJob?: BoardAnalysisJobStatus;
  analysisError?: string;
  onExpand: (post: BoardPost) => void;
  onOpenComments: (post: BoardPost) => void;
  onClose: () => void;
  onRequestAnalysis: (post: BoardPost) => void;
};

function Top10PageRow({
  post,
  rank,
  expanded,
  isToday,
  isAuthenticated,
  analysisJob,
  analysisError,
  onExpand,
  onOpenComments,
  onClose,
  onRequestAnalysis,
}: Top10PageRowProps) {
  const detailsId = useId();
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const resolvedThumbnailSrc = resolveThumbnailSrc(post.thumbnail);
  const thumbnailSrc = thumbnailFailed ? '' : resolvedThumbnailSrc;
  const summary = getPostSummary(post);

  useEffect(() => {
    setThumbnailFailed(false);
  }, [resolvedThumbnailSrc]);

  return (
    <Box component="li" sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <ButtonBase
        component="button"
        type="button"
        aria-expanded={expanded}
        aria-controls={detailsId}
        aria-label={`${rank}위 ${post.title} 상세 보기`}
        onClick={() => {
          if (!expanded) {
            onExpand(post);
          }
        }}
        sx={{
          width: '100%',
          minHeight: 68,
          px: 1.75,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          color: 'text.primary',
          textAlign: 'left',
          transition: 'background-color 120ms ease, color 120ms ease',
          '&:hover': {
            bgcolor: 'background.hover',
            color: 'secondary.main',
          },
          '&.Mui-focusVisible': {
            outline: '3px solid rgba(59, 130, 246, 0.45)',
            outlineOffset: -3,
          },
        }}
      >
        <Top10Rank rank={rank} />

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            component="span"
            variant="caption"
            sx={{ display: 'block', color: 'text.secondary', fontWeight: 700, lineHeight: 1.2 }}
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
              color: 'inherit',
              fontWeight: rank <= 3 ? 700 : 600,
              lineHeight: 1.35,
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
            }}
          >
            {post.title}
          </Typography>
        </Box>

        <ExpandMoreRoundedIcon
          aria-hidden="true"
          sx={{
            flexShrink: 0,
            color: 'text.disabled',
            fontSize: 22,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 160ms ease',
          }}
        />
      </ButtonBase>

      <Collapse id={detailsId} in={expanded} timeout="auto" unmountOnExit>
        <Box
          className="top10-expanded-panel"
          sx={{
            px: 1.75,
            pb: 1.5,
            bgcolor: 'background.raised',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ py: 1, alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
              요약
            </Typography>
            <Tooltip title="닫기">
              <IconButton
                size="small"
                onClick={onClose}
                aria-label={`${rank}위 항목 닫기`}
                sx={{
                  width: 28,
                  height: 28,
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'background.subtle', color: 'secondary.main' },
                }}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            sx={{ alignItems: { xs: 'stretch', sm: 'flex-start' } }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {analysisJob && !summary ? (
                <Stack
                  role="status"
                  aria-live="polite"
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <CircularProgress
                    size={18}
                    variant="determinate"
                    value={analysisJob.progressPercent}
                  />
                  <Typography variant="body2" color="text.secondary">
                    요약 생성 중 {analysisJob.progressPercent}%
                  </Typography>
                </Stack>
              ) : analysisError && !summary ? (
                <Alert
                  severity="warning"
                  action={
                    <Button color="inherit" size="small" onClick={() => onRequestAnalysis(post)}>
                      다시 시도
                    </Button>
                  }
                >
                  요약을 만들지 못했습니다.
                </Alert>
              ) : (
                <Typography
                  variant="body2"
                  color={summary ? 'text.primary' : 'text.secondary'}
                  sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}
                >
                  {summary ||
                    (isToday && !isAuthenticated
                      ? '로그인하면 새 요약을 생성할 수 있습니다.'
                      : '요약 내용이 없습니다.')}
                </Typography>
              )}
            </Box>

            {thumbnailSrc && (
              <Box
                className="top10-expanded-image"
                component="img"
                src={thumbnailSrc}
                alt=""
                onError={() => setThumbnailFailed(true)}
                sx={{
                  width: { xs: '100%', sm: 220 },
                  maxHeight: 240,
                  display: 'block',
                  objectFit: 'contain',
                  flexShrink: 0,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.subtle',
                }}
              />
            )}
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={0.75}
            sx={{ mt: 1.25, justifyContent: 'flex-end' }}
          >
            <Button
              component="a"
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<LaunchRoundedIcon fontSize="small" />}
              aria-label={`${post.title} 원문 새 탭에서 열기`}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                bgcolor: 'background.paper',
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'background.subtle',
                  borderColor: 'divider',
                  color: 'secondary.main',
                },
              }}
            >
              원문 바로가기
            </Button>
            <Button
              type="button"
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<ChatBubbleOutlineRoundedIcon fontSize="small" />}
              onClick={() => onOpenComments(post)}
              disabled={!post.Id}
              aria-label={`${post.title} 댓글 열기`}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                bgcolor: 'background.paper',
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'background.subtle',
                  borderColor: 'divider',
                  color: 'secondary.main',
                },
              }}
            >
              {post.commentCount && post.commentCount > 0 ? `댓글 ${post.commentCount}` : '댓글'}
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}

export function Top10List({
  variant = 'sidebar',
  selectedDate = TOP_BOARDS_TODAY,
  initialExpandedRank,
}: Top10ListProps) {
  const isToday = selectedDate === TOP_BOARDS_TODAY;
  const [expandedItem, setExpandedItem] = useState<{ date: string; postKey: string } | null>(null);
  const [commentTarget, setCommentTarget] = useState<Top10CommentTarget>(null);
  const appliedInitialRankRef = useRef<number | null>(null);
  const { data: posts = [], isError, isPending, isFetching, refetch } = useTopBoards(selectedDate);
  const { analysisJobs, analysisErrors, isAuthenticated, requestAnalysis } =
    useTopBoardAnalysis(selectedDate);
  const expandedPostKey = expandedItem?.date === selectedDate ? expandedItem.postKey : null;
  const heading =
    variant === 'sidebar'
      ? '오늘의 TOP 10'
      : isToday
        ? '오늘의 인기 순위'
        : `${formatHistoryDate(selectedDate)} 인기 순위`;

  useEffect(() => {
    if (
      variant !== 'page' ||
      !isToday ||
      !initialExpandedRank ||
      appliedInitialRankRef.current === initialExpandedRank
    ) {
      return;
    }

    const post = posts[initialExpandedRank - 1];
    if (!post) return;

    appliedInitialRankRef.current = initialExpandedRank;
    setExpandedItem({ date: selectedDate, postKey: postKey(post) });
    requestAnalysis(post).catch(() => undefined);
  }, [initialExpandedRank, isToday, posts, requestAnalysis, selectedDate, variant]);

  return (
    <>
      <Card
        component="section"
        aria-labelledby={`top10-${variant}-title`}
        sx={{ overflow: 'hidden', bgcolor: 'background.paper', borderColor: 'divider' }}
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
            {variant === 'sidebar' ? (
              <Typography
                id="top10-sidebar-title"
                component={Link}
                href="/top10/"
                variant="subtitle1"
                sx={{
                  color: 'text.primary',
                  fontWeight: 800,
                  '&:hover': { color: 'secondary.main' },
                }}
              >
                {heading}
              </Typography>
            ) : (
              <Typography
                id="top10-page-title"
                variant="h6"
                sx={{ color: 'text.primary', fontWeight: 800 }}
              >
                {heading}
              </Typography>
            )}
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
              {isToday
                ? '오늘의 인기 순위를 불러오지 못했습니다.'
                : '선택한 날짜의 인기 순위를 불러오지 못했습니다.'}
            </Alert>
          )}

          {!isPending && !isError && !posts.length && (
            <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {isToday
                  ? '아직 집계된 인기 글이 없습니다.'
                  : '이 날짜에 저장된 인기 글이 없습니다.'}
              </Typography>
            </Box>
          )}

          {!isPending && !isError && !!posts.length && (
            <Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none' }}>
              {posts.slice(0, TOP_BOARDS_LIMIT).map((post, index) => {
                const key = postKey(post);
                const rank = index + 1;

                return variant === 'sidebar' ? (
                  <Top10SidebarRow key={key} post={post} rank={rank} />
                ) : (
                  <Top10PageRow
                    key={`${selectedDate}:${key}`}
                    post={post}
                    rank={rank}
                    expanded={expandedPostKey === key}
                    isToday={isToday}
                    isAuthenticated={isAuthenticated}
                    analysisJob={isToday && post.Id ? analysisJobs[post.Id] : undefined}
                    analysisError={isToday && post.Id ? analysisErrors[post.Id] : undefined}
                    onExpand={(selectedPost) => {
                      setExpandedItem({ date: selectedDate, postKey: key });
                      requestAnalysis(selectedPost).catch(() => undefined);
                    }}
                    onOpenComments={(selectedPost) => {
                      const postId = selectedPost.Id;
                      if (!postId) return;
                      setCommentTarget({ postId, site: selectedPost.site });
                    }}
                    onClose={() => setExpandedItem(null)}
                    onRequestAnalysis={(selectedPost) => {
                      requestAnalysis(selectedPost).catch(() => undefined);
                    }}
                  />
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {variant === 'page' && (
        <CommentDrawer
          open={Boolean(commentTarget)}
          onClose={() => setCommentTarget(null)}
          postId={commentTarget?.postId ?? ''}
          site={commentTarget?.site ?? ''}
          title="댓글"
        />
      )}
    </>
  );
}
