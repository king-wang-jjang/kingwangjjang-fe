'use client';

import type {
  BoardPost,
  BoardAnalysis,
  AnalysisStatus,
  BoardListFilters,
  BoardAnalysisJobStatus,
} from 'src/api/board-api';

import Link from 'next/link';
import { toast } from 'sonner';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import useMediaQuery from '@mui/material/useMediaQuery';
import FilterListIcon from '@mui/icons-material/FilterList';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import {
  Box,
  Card,
  Chip,
  Menu,
  Stack,
  Alert,
  Badge,
  Button,
  Dialog,
  Divider,
  Tooltip,
  Collapse,
  Skeleton,
  MenuItem,
  Checkbox,
  Container,
  IconButton,
  Typography,
  CardContent,
  ListItemText,
  DialogContent,
  CircularProgress,
} from '@mui/material';

import { useBoard } from 'src/hooks/use-board';

import { CONFIG } from 'src/config-global';
import { useReadStore } from 'src/store/read-store';
import { useAuthStore } from 'src/store/auth-store';
import {
  addBoardLike,
  analyzeBoardPost,
  getBoardAnalysis,
  getBoardAnalysisJob,
} from 'src/api/board-api';

import { Top10List } from 'src/components/top10';
import { CommentDrawer, CommentSidebar } from 'src/components/comment';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
};

type SelectedPost = {
  boardId: string;
  site: string;
} | null;

const workbenchSideColumnWidth = 320;
const analysisPollIntervalMs = 1500;
const analysisPollLimit = 80;

export function BoardView({ title = '실시간 게시판' }: Props) {
  const pageTheme = useTheme();
  const isMobile = useMediaQuery(pageTheme.breakpoints.down('md'));
  const isTabletContentViewport = useMediaQuery(
    '(any-pointer: coarse) and (min-width: 900px) and (max-width: 1400px)'
  );
  const isContentFirstLayout = isMobile || isTabletContentViewport;

  const [siteMenuAnchor, setSiteMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<SelectedPost>(null);
  const [mobileCommentOpen, setMobileCommentOpen] = useState(false);
  const [analysisJobsByPostId, setAnalysisJobsByPostId] = useState<
    Record<string, BoardAnalysisJobStatus>
  >({});
  const [analysisStatuses, setAnalysisStatuses] = useState<Record<string, AnalysisStatus>>({});
  const analysisRequestsRef = useRef(new Set<string>());
  const { isAuthenticated } = useAuthStore();
  const boardFilters = useMemo<BoardListFilters>(
    () => ({
      sites: selectedSites,
    }),
    [selectedSites]
  );

  const {
    postData,
    updatePostAnalysis,
    loadingRef,
    filterCollection,
    boardContentsQueryError,
    boardContentsQueryLoading,
  } = useBoard(boardFilters);

  const siteLabels = useMemo(
    () =>
      postData.reduce<Record<string, string>>((labels, post) => {
        labels[post.site] = post.siteLabel;
        return labels;
      }, {}),
    [postData]
  );

  useEffect(() => {
    if (!selectedPost) {
      return;
    }

    const isVisible = postData.some((post) => getPostId(post) === selectedPost.boardId);
    if (!isVisible) {
      setSelectedPost(null);
    }
  }, [postData, selectedPost]);

  const handleToggleSite = useCallback((site: string) => {
    setSelectedSites((current) =>
      current.includes(site) ? current.filter((value) => value !== site) : [...current, site]
    );
  }, []);

  const applyAnalysisResult = useCallback(
    (analysis: BoardAnalysis) => {
      updatePostAnalysis(analysis);

      if (analysis.status === 'done' && analysis.summary) {
        analysisRequestsRef.current.delete(analysis.boardId);
        setAnalysisStatuses((current) => {
          const next = { ...current };
          delete next[analysis.boardId];
          return next;
        });
        return;
      }

      if (analysis.status === 'failed') {
        analysisRequestsRef.current.delete(analysis.boardId);
      }

      setAnalysisStatuses((current) => ({
        ...current,
        [analysis.boardId]: analysis.status,
      }));
    },
    [updatePostAnalysis]
  );

  useEffect(() => {
    const activeIds = Object.entries(analysisStatuses)
      .filter(([, status]) => status === 'pending' || status === 'processing')
      .map(([boardId]) => boardId);

    if (!activeIds.length) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      activeIds.forEach((boardId) => {
        getBoardAnalysis(boardId)
          .then(applyAnalysisResult)
          .catch(() => {
            // Polling failures are transient; the next interval will retry.
          });
      });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [analysisStatuses, applyAnalysisResult]);

  const handlePostSelect = useCallback(
    (post: BoardPost) => {
      const boardId = getPostId(post);

      setSelectedPost({ boardId, site: post.site });
      if (isContentFirstLayout) {
        setMobileCommentOpen(true);
      }

      if (isAuthenticated && shouldAnalyzePost(post) && !analysisRequestsRef.current.has(boardId)) {
        analysisRequestsRef.current.add(boardId);
        setAnalysisJobsByPostId((current) => ({
          ...current,
          [boardId]: createPendingAnalysisJob(boardId),
        }));

        analyzeBoardPost(boardId)
          .then(async (job) => {
            setAnalysisJobsByPostId((current) => ({ ...current, [boardId]: job }));
            const finishedJob = isActiveAnalysisJob(job)
              ? await pollBoardAnalysisJob(job.jobId, (latestJob) => {
                  setAnalysisJobsByPostId((current) => ({ ...current, [boardId]: latestJob }));
                })
              : job;

            if (finishedJob.status === 'completed' && finishedJob.summary) {
              analysisRequestsRef.current.delete(boardId);
              updatePostAnalysis({
                boardId: finishedJob.boardId,
                status: 'done',
                summary: finishedJob.summary,
                tags: finishedJob.tags ?? [],
                llmEngagementScore: finishedJob.llmEngagementScore,
                llmEngagementReason: finishedJob.llmEngagementReason,
              });
              return;
            }

            if (finishedJob.status === 'failed') {
              throw new Error(finishedJob.error || finishedJob.message);
            }
          })
          .catch((error: any) => {
            analysisRequestsRef.current.delete(boardId);
            setAnalysisStatuses((current) => ({
              ...current,
              [boardId]: 'failed',
            }));
            toast.warning(`요약 생성 실패: ${error.message || error}`);
          })
          .finally(() => {
            setAnalysisJobsByPostId((current) => {
              const next = { ...current };
              delete next[boardId];
              return next;
            });
          });
      }
    },
    [isAuthenticated, isContentFirstLayout, updatePostAnalysis]
  );

  const handleCommentOpen = useCallback(
    (post: BoardPost) => {
      handlePostSelect(post);
    },
    [handlePostSelect]
  );

  const handleCommentClose = () => {
    setSelectedPost(null);
    if (isContentFirstLayout) {
      setMobileCommentOpen(false);
    }
  };

  const initialLoading = boardContentsQueryLoading && postData.length === 0;
  const siteMenuOpen = Boolean(siteMenuAnchor);

  const renderSiteMenu = (
    <Menu
      anchorEl={siteMenuAnchor}
      open={siteMenuOpen}
      onClose={() => setSiteMenuAnchor(null)}
      slotProps={{
        paper: {
          sx: {
            minWidth: 240,
            bgcolor: '#fdfdf8',
            border: 1,
            borderColor: '#bfc1b7',
            boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
        },
      }}
    >
      {filterCollection.length ? (
        filterCollection.map((site) => (
          <MenuItem key={site} onClick={() => handleToggleSite(site)}>
            <Checkbox checked={selectedSites.includes(site)} size="small" />
            <ListItemText primary={siteLabels[site] ?? site} />
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>사이트 정보 없음</MenuItem>
      )}
      <Divider sx={{ borderColor: '#bfc1b7' }} />
      <MenuItem
        disabled={!selectedSites.length}
        onClick={() => {
          setSelectedSites([]);
          setSiteMenuAnchor(null);
        }}
      >
        전체 보기
      </MenuItem>
    </Menu>
  );

  const renderFeedHeader = (
    <Card sx={{ bgcolor: '#fdfdf8', borderColor: '#bfc1b7', borderRadius: 1 }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1.25}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5">실시간 게시판</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                수집된 게시글을 빠르게 훑고 댓글 흐름을 확인하세요.
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ alignItems: 'center' }}>
              {isContentFirstLayout && (
                <Button
                  component={Link}
                  href="/top10"
                  color="inherit"
                  variant="outlined"
                  size="small"
                  startIcon={<EmojiEventsOutlinedIcon />}
                  sx={{ bgcolor: '#fdfdf8', whiteSpace: 'nowrap' }}
                >
                  TOP 10
                </Button>
              )}
              <Chip
                label={`${postData.length}개 게시글`}
                size="small"
                sx={{ bgcolor: '#e5e7e0', borderColor: '#bfc1b7' }}
              />
            </Stack>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Tooltip title="사이트 필터">
              <IconButton
                className="filter-icon-button"
                color="inherit"
                onClick={(event) => setSiteMenuAnchor(event.currentTarget)}
                aria-label="사이트 필터"
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#fdfdf8',
                  border: 1,
                  borderColor: '#bfc1b7',
                  color: '#4d4f46',
                  '&:hover': {
                    bgcolor: '#f4f4f4',
                    borderColor: '#bfc1b7',
                    color: '#F54E00',
                  },
                }}
              >
                <Badge color="secondary" variant="dot" invisible={!selectedSites.length}>
                  <FilterListIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            {selectedSites.map((site) => (
              <Chip
                key={site}
                size="small"
                label={siteLabels[site] ?? site}
                onDelete={() => handleToggleSite(site)}
                sx={{ bgcolor: '#e5e7e0', borderColor: '#bfc1b7' }}
              />
            ))}

            {!!selectedSites.length && (
              <Button color="inherit" size="small" onClick={() => setSelectedSites([])}>
                필터 초기화
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderToolPane = <Top10List variant="sidebar" />;

  const renderCommentEmptyState = (
    <Card sx={{ minHeight: 240, bgcolor: '#eeefe9', borderColor: '#bfc1b7', borderRadius: 1 }}>
      <CardContent
        sx={{
          minHeight: 240,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Box>
          <Typography variant="h6">댓글을 보려면 게시글을 선택하세요.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            게시글을 열면 이 영역에서 댓글을 바로 확인할 수 있습니다.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderPostList = (
    <Stack spacing={1}>
      {initialLoading
        ? Array.from({ length: 5 }).map((_, index) => <PostCardSkeleton key={index} />)
        : postData.map((post) => (
            <BoardPostCard
              key={getPostId(post)}
              post={post}
              selected={selectedPost?.boardId === getPostId(post)}
              analysisJob={analysisJobsByPostId[getPostId(post)]}
              onPostSelect={handlePostSelect}
              onCommentOpen={handleCommentOpen}
            />
          ))}

      {!initialLoading && !postData.length && (
        <Card sx={{ bgcolor: '#fdfdf8', borderColor: '#bfc1b7', borderRadius: 1 }}>
          <CardContent sx={{ py: 5, textAlign: 'center' }}>
            <Typography variant="h6">게시글이 없습니다</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              필터를 초기화하거나 새 게시글이 수집될 때까지 기다려 주세요.
            </Typography>
          </CardContent>
        </Card>
      )}

      {boardContentsQueryLoading && postData.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      <Box ref={loadingRef} sx={{ height: 1 }} />
    </Stack>
  );

  return (
    <Container maxWidth={false} disableGutters aria-label={title}>
      <Stack
        className="BoardWorkbenchFrame"
        spacing={1.25}
        sx={{ alignItems: 'center', width: '100%' }}
      >
        {boardContentsQueryError && !postData.length && (
          <Alert
            severity="warning"
            sx={{
              width: 'min(100%, 1536px)',
              boxSizing: 'border-box',
              bgcolor: '#eeefe9',
              border: 1,
              borderColor: '#bfc1b7',
              color: '#4d4f46',
            }}
          >
            게시글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </Alert>
        )}

        <Box
          className="BoardWorkbench"
          sx={{
            display: isContentFirstLayout ? 'block' : 'grid',
            gridTemplateColumns: `${workbenchSideColumnWidth}px minmax(0, 1fr) ${workbenchSideColumnWidth}px`,
            gap: 1.5,
            alignItems: 'start',
            width: 'min(100%, 1536px)',
            boxSizing: 'border-box',
            mx: 'auto',
          }}
        >
          <Box
            sx={{
              display: isContentFirstLayout ? 'none' : 'block',
              position: 'sticky',
              top: 78,
              maxHeight: 'calc(100vh - 94px)',
              overflowY: 'auto',
              pr: 0.25,
              scrollbarWidth: 'thin',
            }}
          >
            {renderToolPane}
          </Box>

          <Stack spacing={1.25} sx={{ minWidth: 0 }}>
            {renderFeedHeader}
            {renderPostList}
          </Stack>

          <Box
            sx={{ display: isContentFirstLayout ? 'none' : 'block', position: 'sticky', top: 78 }}
          >
            {selectedPost ? (
              <CommentSidebar
                postId={selectedPost.boardId}
                site={selectedPost.site}
                title="댓글"
                onClose={handleCommentClose}
              />
            ) : (
              renderCommentEmptyState
            )}
          </Box>
        </Box>

        {renderSiteMenu}

        {selectedPost && (
          <CommentDrawer
            open={isContentFirstLayout && mobileCommentOpen}
            onClose={handleCommentClose}
            postId={selectedPost.boardId}
            site={selectedPost.site}
            title="댓글"
          />
        )}
      </Stack>
    </Container>
  );
}

// ----------------------------------------------------------------------

type BoardPostCardProps = {
  post: BoardPost;
  selected: boolean;
  analysisJob?: BoardAnalysisJobStatus;
  onPostSelect: (post: BoardPost) => void;
  onCommentOpen: (post: BoardPost) => void;
};

function BoardPostCard({
  post,
  selected,
  analysisJob,
  onPostSelect,
  onCommentOpen,
}: BoardPostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(post.likeCount ?? 0);

  const { isAuthenticated } = useAuthStore();
  const { isRead, markAsRead } = useReadStore();

  const boardId = getPostId(post);
  const readStatus = isRead(boardId);
  const resolvedThumbnailSrc = resolveThumbnailSrc(post.thumbnail);
  const thumbnailSrc = thumbnailFailed ? '' : resolvedThumbnailSrc;
  const summary = getPostSummary(post);
  const tags = getPostTags(post);
  const analyzing = isActiveAnalysisJob(analysisJob);
  const progressPercent = analysisJob?.progressPercent ?? 0;
  const crawledPreview = getCrawledContentPreview(post);

  useEffect(() => {
    setCurrentLikeCount(post.likeCount ?? 0);
  }, [post.likeCount]);

  useEffect(() => {
    setThumbnailFailed(false);
  }, [resolvedThumbnailSrc]);

  const handleThumbnailError = () => {
    setThumbnailFailed(true);
    setImageOpen(false);
  };

  const handleCardClick = () => {
    const selection = window.getSelection();
    if (selection?.toString()) {
      return;
    }

    setExpanded(true);
    onPostSelect(post);
    markAsRead(boardId);
  };

  const handleCloseExpanded = (event: React.MouseEvent) => {
    event.stopPropagation();
    setExpanded(false);
    markAsRead(boardId);
  };

  const handleLike = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      const result = await addBoardLike(boardId);
      setCurrentLikeCount(result.likeCount);
    } catch (error: any) {
      toast.warning(`좋아요 추가 실패: ${error.message || error}`);
    }
  };

  const handleOpenComments = (event: React.MouseEvent) => {
    event.stopPropagation();
    markAsRead(boardId);
    onCommentOpen(post);
  };

  const handleOpenSource = (event: React.MouseEvent) => {
    event.stopPropagation();
    markAsRead(boardId);
  };

  const renderSideImageSlot = thumbnailSrc ? (
    <Box
      className="card-side-image-slot compact-site-marker"
      component="button"
      type="button"
      aria-label="Open image"
      onClick={(event) => {
        event.stopPropagation();
        setImageOpen(true);
      }}
      sx={{
        p: 0,
        width: { xs: 72, sm: 96 },
        height: { xs: 72, sm: 96 },
        border: 1,
        borderColor: '#bfc1b7',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: '#eeefe9',
        cursor: 'zoom-in',
        flexShrink: 0,
        alignSelf: 'flex-start',
        opacity: 0.86,
      }}
    >
      <Box
        component="img"
        src={thumbnailSrc}
        alt=""
        onError={handleThumbnailError}
        sx={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
        }}
      />
    </Box>
  ) : (
    <Box
      className="card-side-image-slot compact-site-marker"
      sx={{
        width: { xs: 72, sm: 96 },
        height: { xs: 72, sm: 96 },
        border: 1,
        borderColor: '#d5d7cd',
        borderRadius: 1,
        display: 'grid',
        placeItems: 'center',
        bgcolor: '#f1f2ec',
        color: '#65675e',
        fontSize: 18,
        fontWeight: 750,
        flexShrink: 0,
        alignSelf: 'flex-start',
      }}
    >
      {post.siteLabel.slice(0, 1)}
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 1,
        }}
      >
        <Card
          className="quiet-list-card post-card-surface"
          sx={{
            width: '100%',
            zIndex: 1,
            position: 'relative',
            borderColor: selected ? '#d9b59f' : '#bfc1b7',
            bgcolor: readStatus ? '#f3f4ee' : '#fdfdf8',
            borderRadius: 1,
            boxShadow: selected ? 'inset 3px 0 0 #F54E00' : 'inset 3px 0 0 transparent',
            transition:
              'border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease',
            '&:hover': {
              borderColor: selected ? '#d9b59f' : '#aeb1a6',
              bgcolor: '#fbfbf5',
            },
          }}
        >
          <CardContent
            onClick={handleCardClick}
            sx={{
              p: { xs: 1, sm: 1.25 },
              cursor: 'pointer',
              '&:last-child': {
                pb: { xs: 1, sm: 1.25 },
              },
            }}
          >
            <Stack spacing={0.875}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'stretch' }}>
                <Stack spacing={0.875} sx={{ minWidth: 0, flex: 1 }}>
                  <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                    <Stack
                      className="metadata-chip-row"
                      direction="row"
                      spacing={0.625}
                      useFlexGap
                      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                      <Chip
                        label={post.siteLabel}
                        size="small"
                        variant="outlined"
                        sx={{
                          bgcolor: '#e5e7e0',
                          borderColor: '#bfc1b7',
                          color: '#4d4f46',
                          height: 22,
                          '& .MuiChip-label': {
                            px: 0.75,
                          },
                        }}
                      />
                      {tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 22,
                            bgcolor: '#f8f3ec',
                            borderColor: '#e2c6b0',
                            color: '#6b4b36',
                            '& .MuiChip-label': {
                              px: 0.75,
                            },
                          }}
                        />
                      ))}
                      <Typography variant="caption" color="text.secondary">
                        {formatRelativeTime(post.createTime)}
                      </Typography>
                    </Stack>

                    <Typography
                      className="post-card-title"
                      variant="subtitle1"
                      sx={{
                        color: readStatus ? '#4d4f46' : '#23251d',
                        fontWeight: readStatus ? 650 : 750,
                        lineHeight: 1.34,
                        wordBreak: 'keep-all',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {post.title}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={0.5}
                    useFlexGap
                    sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    <Chip
                      icon={<ChatBubbleOutlineIcon fontSize="small" />}
                      label={`${post.commentCount ?? 0}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 24,
                        bgcolor: 'transparent',
                        borderColor: 'transparent',
                        color: '#65675e',
                        '& .MuiChip-label': {
                          px: 0.5,
                        },
                        '& .MuiChip-icon': {
                          color: 'inherit',
                          ml: 0,
                        },
                      }}
                    />

                    <Tooltip title="좋아요">
                      <Button
                        className="post-card-action"
                        size="small"
                        color="inherit"
                        disableRipple
                        startIcon={<FavoriteBorderIcon fontSize="small" />}
                        onClick={handleLike}
                        sx={{
                          minWidth: 0,
                          px: 0.5,
                          py: 0,
                          color: '#65675e',
                          '&:hover': {
                            bgcolor: 'transparent',
                          },
                          '&:active': {
                            bgcolor: 'transparent',
                          },
                          '& .MuiButton-startIcon': {
                            mr: 0.5,
                          },
                        }}
                      >
                        {currentLikeCount}
                      </Button>
                    </Tooltip>
                  </Stack>
                </Stack>

                {renderSideImageSlot}
              </Stack>

              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box
                  className="expanded-summary-panel"
                  sx={{
                    mt: 0.25,
                    pt: 1,
                    borderTop: 1,
                    borderColor: '#d7d9cf',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 0.75, alignItems: 'flex-start', justifyContent: 'space-between' }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      요약
                    </Typography>
                    <Tooltip title="닫기">
                      <IconButton
                        className="expanded-card-close post-card-action"
                        size="small"
                        onClick={handleCloseExpanded}
                        aria-label="확장 닫기"
                        sx={{
                          width: 26,
                          height: 26,
                          color: '#65675e',
                          '&:hover': {
                            bgcolor: '#eeefe9',
                            color: '#F54E00',
                          },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  {analyzing ? (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <CircularProgress size={18} variant="determinate" value={progressPercent} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" color="text.secondary">
                          요약 생성 중 {progressPercent}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getAnalysisRemainingText(analysisJob)}
                        </Typography>
                      </Box>
                    </Stack>
                  ) : (
                    <Typography
                      variant="body2"
                      color={summary ? 'text.primary' : 'text.secondary'}
                      sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}
                    >
                      {summary ||
                        (isAuthenticated
                          ? '요약 내용이 없습니다.'
                          : '로그인하면 새 요약을 생성할 수 있습니다.')}
                    </Typography>
                  )}

                  <Stack
                    spacing={0.5}
                    sx={{
                      mt: 1,
                      pt: 1,
                      borderTop: 1,
                      borderColor: '#e1e3d8',
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      sx={{
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        수집 데이터
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {crawledPreview.itemCount}개 / {crawledPreview.textLength}자
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      color={crawledPreview.snippet ? 'text.secondary' : 'error.main'}
                      sx={{ display: 'block', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}
                    >
                      {crawledPreview.snippet || '수집된 본문 데이터가 없습니다.'}
                    </Typography>
                  </Stack>

                  <Stack
                    className="expanded-card-actions"
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={0.75}
                    sx={{ mt: 1, justifyContent: 'flex-end' }}
                  >
                    <Button
                      component="a"
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<LaunchIcon fontSize="small" />}
                      onClick={handleOpenSource}
                      sx={{
                        width: { xs: '100%', sm: 'auto' },
                        bgcolor: '#fdfdf8',
                        borderColor: '#bfc1b7',
                        color: '#4d4f46',
                        '&:hover': {
                          bgcolor: '#eeefe9',
                          borderColor: '#bfc1b7',
                          color: '#F54E00',
                        },
                      }}
                    >
                      원문 바로가기
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<ChatBubbleOutlineIcon fontSize="small" />}
                      onClick={handleOpenComments}
                      sx={{
                        width: { xs: '100%', sm: 'auto' },
                        bgcolor: '#fdfdf8',
                        borderColor: '#bfc1b7',
                        color: '#4d4f46',
                        '&:hover': {
                          bgcolor: '#eeefe9',
                          borderColor: '#bfc1b7',
                          color: '#F54E00',
                        },
                      }}
                    >
                      댓글 열기
                    </Button>
                  </Stack>
                </Box>
              </Collapse>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Dialog
        open={imageOpen}
        onClose={() => setImageOpen(false)}
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
              borderRadius: 1,
            },
          },
        }}
      >
        <DialogContent sx={{ position: 'relative', p: 0 }}>
          <IconButton
            onClick={() => setImageOpen(false)}
            aria-label="이미지 닫기"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              bgcolor: 'rgba(17, 24, 39, 0.72)',
              color: '#ffffff',
              '&:hover': {
                bgcolor: 'rgba(17, 24, 39, 0.86)',
                color: '#F7A501',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {thumbnailSrc && (
            <Box
              component="img"
              src={thumbnailSrc}
              alt=""
              onError={handleThumbnailError}
              sx={{
                width: '100%',
                maxHeight: '86vh',
                objectFit: 'contain',
                display: 'block',
                bgcolor: '#111827',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------

function PostCardSkeleton() {
  return (
    <Card sx={{ bgcolor: '#fdfdf8', borderColor: '#bfc1b7', borderRadius: 1 }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" spacing={1.25}>
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Skeleton width={92} height={24} />
            <Skeleton width="88%" height={28} />
            <Skeleton width="54%" />
          </Stack>
          <Skeleton variant="rounded" width={82} height={82} />
        </Stack>
      </CardContent>
    </Card>
  );
}

function getPostId(post: BoardPost) {
  return post.Id || `${post.site}-${post.no}`;
}

function resolveThumbnailSrc(thumbnail?: string | null) {
  const trimmedThumbnail = thumbnail?.trim();
  if (!trimmedThumbnail) {
    return '';
  }

  const thumbnailPath = trimmedThumbnail.split(/[?#]/, 1)[0].replace(/\\/g, '/').toLowerCase();
  const fileName = thumbnailPath.split('/').pop();
  if (
    fileName === 'icon_app_20160427.png' ||
    fileName === 'cdn_img_404.jpg' ||
    /\.(?:m3u8|m4v|mov|mp4|webm)$/.test(thumbnailPath)
  ) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmedThumbnail)) {
    return trimmedThumbnail;
  }

  const imageServerUrl = CONFIG.imageServerUrl.replace(/\/+$/, '');
  const normalizedThumbnailPath = trimmedThumbnail.replace(/\\/g, '/').replace(/^\/+/, '');

  return `${imageServerUrl}/${normalizedThumbnailPath}`;
}

const DEFAULT_GPT_ANSWER = 'GPT 생성 중입니다. 이미지가 많은 경우 오래 걸립니다.';

function getPostSummary(post: BoardPost) {
  const summary = typeof post.gptAnswer === 'string' ? post.gptAnswer.trim() : '';
  return summary && summary !== DEFAULT_GPT_ANSWER ? summary : '';
}

function getCrawledContentPreview(post: BoardPost) {
  const texts: string[] = [];
  const { contents } = post;
  let itemCount = 0;

  const appendText = (value: unknown) => {
    if (typeof value !== 'string') {
      return;
    }
    const trimmed = value.trim();
    if (trimmed) {
      texts.push(trimmed);
    }
  };

  if (typeof contents === 'string') {
    itemCount = contents.trim() ? 1 : 0;
    appendText(contents);
  } else if (Array.isArray(contents)) {
    itemCount = contents.length;
    contents.forEach((item) => {
      if (isRecord(item)) {
        appendText(item.content);
        appendText(item.text);
        appendText(item.alt_text);
        appendText(item.alt);
      } else {
        appendText(item);
      }
    });
  } else if (isRecord(contents)) {
    const values = Object.values(contents);
    itemCount = values.length;
    values.forEach(appendText);
  }

  const text = texts.join('\n').trim();

  return {
    itemCount,
    textLength: text.length,
    snippet: text.length > 240 ? `${text.slice(0, 240)}...` : text,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function shouldAnalyzePost(post: BoardPost) {
  return Boolean(post.Id) && !getPostSummary(post);
}

function createPendingAnalysisJob(boardId: string): BoardAnalysisJobStatus {
  return {
    jobId: '',
    boardId,
    status: 'queued',
    progressPercent: 5,
    estimatedSecondsRemaining: 60,
    message: 'Analysis job queued.',
    tags: [],
  };
}

function isActiveAnalysisJob(job?: BoardAnalysisJobStatus) {
  return job?.status === 'queued' || job?.status === 'running';
}

function getAnalysisRemainingText(job?: BoardAnalysisJobStatus) {
  const estimatedSecondsRemaining = job?.estimatedSecondsRemaining;
  if (typeof estimatedSecondsRemaining === 'number' && estimatedSecondsRemaining > 0) {
    return `약 ${estimatedSecondsRemaining}초 남음`;
  }
  return '남은 시간을 계산 중입니다.';
}

async function pollBoardAnalysisJob(
  jobId: string,
  onUpdate: (job: BoardAnalysisJobStatus) => void,
  attempt = 0
) {
  const latestJob = await getBoardAnalysisJob(jobId);
  onUpdate(latestJob);

  if (!isActiveAnalysisJob(latestJob) || attempt >= analysisPollLimit) {
    return latestJob;
  }

  await delay(analysisPollIntervalMs);
  return pollBoardAnalysisJob(jobId, onUpdate, attempt + 1);
}

function delay(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function getPostTags(post: BoardPost) {
  return Array.isArray(post.tags) ? post.tags.filter(Boolean) : [];
}

function formatRelativeTime(value: string) {
  const created = new Date(value);

  if (Number.isNaN(created.getTime())) {
    return '';
  }

  const diffMinutes = Math.max(0, Math.floor((Date.now() - created.getTime()) / 60000));

  if (diffMinutes < 5) {
    return '방금';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}
