'use client';

import type { BoardPost } from 'src/api/board-api';

import { toast } from 'sonner';
import { useMemo, useState, useEffect, useCallback } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterListIcon from '@mui/icons-material/FilterList';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import {
  Box,
  Card,
  Chip,
  Grid,
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
  useTheme,
  Container,
  IconButton,
  Typography,
  CardContent,
  ListItemText,
  DialogContent,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';

import { useBoard } from 'src/hooks/use-board';

import { CONFIG } from 'src/config-global';
import { addBoardLike } from 'src/api/board-api';
import { useReadStore } from 'src/store/read-store';
import { useAuthStore } from 'src/store/auth-store';

import { CommentDrawer, CommentSidebar } from 'src/components/comment';

import SocialLoginButtons from 'src/auth/components/form-oauth';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
};

type SelectedPost = {
  boardId: string;
  site: string;
} | null;

export function BoardView({ title = '실시간 인기 게시판' }: Props) {
  const pageTheme = useTheme();
  const isMobile = useMediaQuery(pageTheme.breakpoints.down('md'));

  const [siteMenuAnchor, setSiteMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<SelectedPost>(null);
  const [mobileCommentOpen, setMobileCommentOpen] = useState(false);

  const {
    postData,
    loadingRef,
    filterCollection,
    boardContentsQueryError,
    boardContentsQueryLoading,
  } = useBoard();

  const filteredPosts = useMemo(() => {
    if (!selectedSites.length) {
      return postData;
    }

    return postData.filter((post) => selectedSites.includes(post.site));
  }, [postData, selectedSites]);

  useEffect(() => {
    if (!selectedPost) {
      return;
    }

    const isVisible = filteredPosts.some((post) => getPostId(post) === selectedPost.boardId);
    if (!isVisible) {
      setSelectedPost(null);
    }
  }, [filteredPosts, selectedPost]);

  const handleToggleSite = useCallback((site: string) => {
    setSelectedSites((current) =>
      current.includes(site) ? current.filter((value) => value !== site) : [...current, site]
    );
  }, []);

  const handleCommentOpen = useCallback(
    (post: BoardPost) => {
      const boardId = getPostId(post);

      setSelectedPost({ boardId, site: post.site });
      if (isMobile) {
        setMobileCommentOpen(true);
      }
    },
    [isMobile]
  );

  const handleCommentClose = () => {
    setSelectedPost(null);
    if (isMobile) {
      setMobileCommentOpen(false);
    }
  };

  const initialLoading = boardContentsQueryLoading && postData.length === 0;
  const siteMenuOpen = Boolean(siteMenuAnchor);

  const renderFilters = (
    <Card>
      <CardContent
        sx={{
          p: 2,
          '&:last-child': {
            pb: 2,
          },
        }}
      >
        <Stack
          spacing={1.5}
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button
              disableRipple
              color="inherit"
              endIcon={
                <Badge color="error" variant="dot" invisible={!selectedSites.length}>
                  <FilterListIcon />
                </Badge>
              }
              onClick={(event) => setSiteMenuAnchor(event.currentTarget)}
            >
              Filters
            </Button>

            {selectedSites.map((site) => (
              <Chip key={site} size="small" label={site} onDelete={() => handleToggleSite(site)} />
            ))}
          </Stack>

          {!!selectedSites.length && (
            <Button color="inherit" onClick={() => setSelectedSites([])}>
              필터 초기화
            </Button>
          )}
        </Stack>

        <Menu
          anchorEl={siteMenuAnchor}
          open={siteMenuOpen}
          onClose={() => setSiteMenuAnchor(null)}
          PaperProps={{ sx: { minWidth: 240 } }}
        >
          {filterCollection.length ? (
            filterCollection.map((site) => (
              <MenuItem key={site} onClick={() => handleToggleSite(site)}>
                <Checkbox checked={selectedSites.includes(site)} size="small" />
                <ListItemText primary={site} />
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>사이트 정보 없음</MenuItem>
          )}
          <Divider />
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
      </CardContent>
    </Card>
  );

  const renderPostList = (
    <Stack spacing={2.8}>
      {initialLoading
        ? Array.from({ length: 5 }).map((_, index) => <PostCardSkeleton key={index} />)
        : filteredPosts.map((post) => (
            <BoardPostCard
              key={getPostId(post)}
              post={post}
              selected={selectedPost?.boardId === getPostId(post)}
              onCommentOpen={handleCommentOpen}
            />
          ))}

      {!initialLoading && !filteredPosts.length && (
        <Card>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="h6">표시할 게시글이 없습니다</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              사이트 필터를 초기화하거나 새 게시글이 수집될 때까지 기다려 주세요.
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
    <Container maxWidth="lg" disableGutters aria-label={title}>
      <Stack spacing={2.5}>
        {boardContentsQueryError && (
          <Alert severity="warning">
            게시글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </Alert>
        )}

        {isMobile ? (
          <Stack spacing={2}>
            {renderFilters}
            {renderPostList}
          </Stack>
        ) : (
          <Grid container spacing={2} position="relative">
            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  width: '100%',
                  position: 'sticky',
                  top: 136,
                  display: 'flex',
                  justifyContent: 'center',
                  p: 2,
                }}
              >
                <SocialLoginButtons />
              </Card>
            </Grid>

            <Grid item xs={12} md={selectedPost ? 5 : 6}>
              <Stack spacing={2}>
                {renderFilters}
                {renderPostList}
              </Stack>
            </Grid>

            <Grid item xs={12} md={selectedPost ? 4 : 3}>
              {selectedPost ? (
                <CommentSidebar
                  postId={selectedPost.boardId}
                  site={selectedPost.site}
                  title="댓글"
                  onClose={handleCommentClose}
                />
              ) : (
                <Box sx={{ display: { xs: 'none', md: 'block' }, minHeight: 1 }} />
              )}
            </Grid>
          </Grid>
        )}

        {selectedPost && (
          <CommentDrawer
            open={mobileCommentOpen}
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
  onCommentOpen: (post: BoardPost) => void;
};

function BoardPostCard({ post, selected, onCommentOpen }: BoardPostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(post.likeCount ?? 0);

  const { isAuthenticated } = useAuthStore();
  const { isRead, markAsRead } = useReadStore();

  const boardId = getPostId(post);
  const readStatus = isRead(boardId);
  const thumbnailSrc = post.thumbnail ? `${CONFIG.imageServerUrl}/${post.thumbnail}` : '';
  const summary = getPostSummary(post);

  useEffect(() => {
    setCurrentLikeCount(post.likeCount ?? 0);
  }, [post.likeCount]);

  const handleToggle = () => {
    const selection = window.getSelection();
    if (selection?.toString()) {
      return;
    }

    setExpanded((open) => !open);
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

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          '&:hover .post-card-surface': {
            transform: { xs: 'none', md: 'translateX(-50px)' },
          },
        }}
      >
        <Card
          className="post-card-surface"
          sx={{
            width: '100%',
            zIndex: 1,
            position: 'relative',
            borderColor: selected ? 'primary.main' : 'divider',
            bgcolor: readStatus ? 'rgba(255,255,255,0.68)' : 'background.paper',
            transition:
              'transform 300ms ease, border-color 160ms ease, background-color 160ms ease',
          }}
        >
          <CardContent
            onClick={handleToggle}
            sx={{
              p: { xs: 1.5, sm: 2 },
              cursor: 'pointer',
              '&:last-child': {
                pb: { xs: 1.5, sm: 2 },
              },
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Chip label={post.site} size="small" color="primary" variant="outlined" />
                    <Typography variant="caption" color="text.secondary">
                      {formatRelativeTime(post.createTime)}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 750,
                      lineHeight: 1.45,
                      opacity: readStatus ? 0.68 : 1,
                      wordBreak: 'keep-all',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {post.title}
                  </Typography>
                </Stack>

                {thumbnailSrc ? (
                  <Box
                    component="button"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setImageOpen(true);
                    }}
                    sx={{
                      p: 0,
                      width: { xs: 72, sm: 88 },
                      height: { xs: 72, sm: 88 },
                      border: 0,
                      borderRadius: 1,
                      overflow: 'hidden',
                      bgcolor: 'action.hover',
                      cursor: 'zoom-in',
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src={thumbnailSrc}
                      alt=""
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
                    sx={{
                      width: { xs: 72, sm: 88 },
                      height: { xs: 72, sm: 88 },
                      borderRadius: 1,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'action.hover',
                      color: 'text.secondary',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {post.site.slice(0, 1)}
                  </Box>
                )}
              </Stack>

              <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                <Tooltip title="댓글 열기">
                  <Button
                    size="small"
                    color={selected ? 'primary' : 'inherit'}
                    startIcon={<ChatBubbleOutlineIcon fontSize="small" />}
                    onClick={handleOpenComments}
                  >
                    {post.commentCount ?? 0}
                  </Button>
                </Tooltip>

                <Tooltip title="좋아요">
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<FavoriteBorderIcon fontSize="small" />}
                    onClick={handleLike}
                  >
                    {currentLikeCount}
                  </Button>
                </Tooltip>

                <Button
                  size="small"
                  component="a"
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LaunchIcon fontSize="small" />}
                  onClick={handleOpenSource}
                  sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                >
                  원문
                </Button>

                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleToggle();
                  }}
                  aria-label={expanded ? '요약 닫기' : '요약 열기'}
                  sx={{ ml: 'auto' }}
                >
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Stack>

              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Divider sx={{ mb: 1.5 }} />
                <Typography
                  variant="body2"
                  color={summary ? 'text.primary' : 'text.secondary'}
                  sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
                >
                  {summary || '요약 내용이 없습니다.'}
                </Typography>
              </Collapse>
            </Stack>
          </CardContent>
        </Card>

        <Box
          component="a"
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpenSource}
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            borderRadius: 2,
            bgcolor: '#3b82f6',
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'flex-end',
            pr: 1.5,
          }}
        >
          <LaunchIcon sx={{ width: 42, height: 42, color: '#ffffff' }} />
        </Box>
      </Box>

      <Dialog open={imageOpen} onClose={() => setImageOpen(false)} maxWidth="lg">
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
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1.5}>
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Skeleton width={92} height={24} />
            <Skeleton width="88%" height={28} />
            <Skeleton width="54%" />
          </Stack>
          <Skeleton variant="rounded" width={88} height={88} />
        </Stack>
      </CardContent>
    </Card>
  );
}

function getPostId(post: BoardPost) {
  return post.Id || `${post.site}-${post.no}`;
}

function getPostSummary(post: BoardPost) {
  if (post.gptAnswer) {
    return post.gptAnswer;
  }

  if (typeof post.contents === 'string') {
    return post.contents;
  }

  if (Array.isArray(post.contents)) {
    return post.contents.map((item) => String(item)).join('\n');
  }

  return '';
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
