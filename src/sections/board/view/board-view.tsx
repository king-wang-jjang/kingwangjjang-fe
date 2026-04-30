'use client';

import type { BoardPost } from 'src/api/board-api';

import Link from 'next/link';
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
  Menu,
  Stack,
  Alert,
  Badge,
  Button,
  Dialog,
  Divider,
  Collapse,
  Skeleton,
  MenuItem,
  Checkbox,
  useTheme,
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

type Props = {
  title?: string;
};

type SelectedPost = {
  boardId: string;
  site: string;
} | null;

export function BoardView({ title = '실시간 인기글' }: Props) {
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

  return (
    <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
      <Stack spacing={1.5}>
        <Card
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: 1.5,
            border: '1px solid #bfc1b7',
            borderRadius: '6px',
            bgcolor: '#fdfdf8',
            boxShadow: 'none',
          }}
        >
          <Stack
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: '#23251d',
                  fontSize: { xs: 22, sm: 24 },
                  fontWeight: 800,
                  lineHeight: 1.25,
                }}
              >
                {title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#65675e', mt: 0.25 }}>
                {filteredPosts.length.toLocaleString()}개 글을 보고 있어요
                {selectedSites.length ? ` · 사이트 ${selectedSites.length}개 필터 적용` : ''}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexShrink={0} justifyContent="flex-end">
              {!!selectedSites.length && (
                <Button
                  size="small"
                  onClick={() => setSelectedSites([])}
                  sx={{
                    height: 34,
                    px: 1.5,
                    border: '1px solid #bfc1b7',
                    borderRadius: '4px',
                    bgcolor: '#fdfdf8',
                    color: '#4d4f46',
                    fontWeight: 800,
                    '&:hover': {
                      bgcolor: '#f4f4f4',
                      color: '#F54E00',
                    },
                  }}
                >
                  Reset
                </Button>
              )}

              <Button
                size="small"
                startIcon={<FilterListIcon />}
                onClick={(event) => setSiteMenuAnchor(event.currentTarget)}
                sx={{
                  height: 34,
                  px: 1.5,
                  border: '1px solid #bfc1b7',
                  borderRadius: '4px',
                  bgcolor: '#eeefe9',
                  color: '#23251d',
                  fontWeight: 800,
                  '&:hover': {
                    bgcolor: '#f4f4f4',
                    color: '#F54E00',
                  },
                }}
              >
                사이트
                <Badge
                  color="primary"
                  badgeContent={selectedSites.length}
                  invisible={!selectedSites.length}
                  sx={{ ml: 1.5 }}
                />
              </Button>
            </Stack>
          </Stack>

          {!!selectedSites.length && (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
              {selectedSites.map((site) => (
                <Chip
                  key={site}
                  size="small"
                  label={site}
                  onDelete={() => handleToggleSite(site)}
                  sx={{
                    bgcolor: '#eeefe9',
                    border: '1px solid #bfc1b7',
                    color: '#23251d',
                    fontWeight: 700,
                  }}
                />
              ))}
            </Stack>
          )}

          <Menu
            anchorEl={siteMenuAnchor}
            open={siteMenuOpen}
            onClose={() => setSiteMenuAnchor(null)}
            PaperProps={{
              sx: {
                minWidth: 240,
                mt: 0.75,
                border: '1px solid #bfc1b7',
                boxShadow: 'none',
              },
            }}
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
        </Card>

        {boardContentsQueryError && (
          <Alert severity="warning">
            게시글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            alignItems: 'start',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(320px, 1fr)' },
          }}
        >
          <Stack spacing={1.25}>
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
              <Card sx={{ border: '1px solid #bfc1b7', boxShadow: 'none' }}>
                <CardContent sx={{ py: 6, textAlign: 'center' }}>
                  <Typography variant="h6">표시할 게시글이 없습니다</Typography>
                  <Typography variant="body2" sx={{ color: '#65675e', mt: 0.75 }}>
                    사이트 필터를 초기화하거나 새 게시글이 수집될 때까지 기다려 주세요.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {boardContentsQueryLoading && postData.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} sx={{ color: '#F54E00' }} />
              </Box>
            )}

            <Box ref={loadingRef} sx={{ height: 1 }} />
          </Stack>

          {!isMobile &&
            (selectedPost ? (
              <CommentSidebar
                postId={selectedPost.boardId}
                site={selectedPost.site}
                title="댓글"
                onClose={handleCommentClose}
                sx={{ top: 88, height: 'calc(100vh - 112px)' }}
              />
            ) : (
              <Card
                sx={{
                  position: 'sticky',
                  top: 88,
                  p: 2,
                  minHeight: 180,
                  border: '1px solid #bfc1b7',
                  borderRadius: '6px',
                  bgcolor: '#eeefe9',
                  boxShadow: 'none',
                }}
              >
                <Typography variant="h6" sx={{ color: '#23251d', fontWeight: 800, mb: 0.75 }}>
                  댓글
                </Typography>
                <Typography variant="body2" sx={{ color: '#65675e', lineHeight: 1.6 }}>
                  카드를 누르면 여기에서 댓글을 바로 볼 수 있어요.
                </Typography>
              </Card>
            ))}
        </Box>

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
    </Box>
  );
}

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
  const thumbnailSrc = post.thumbnail
    ? `${CONFIG.imageServerUrl}/${post.thumbnail}`
    : '/favicon.svg';
  const summary = getPostSummary(post);

  useEffect(() => {
    setCurrentLikeCount(post.likeCount ?? 0);
  }, [post.likeCount]);

  const handleSelectCard = () => {
    const selection = window.getSelection();
    if (selection?.toString()) {
      return;
    }

    setExpanded(true);
    markAsRead(boardId);
    onCommentOpen(post);
  };

  const handleToggleSummary = (event: React.MouseEvent) => {
    event.stopPropagation();
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

  const handleOpenSource = (event: React.MouseEvent) => {
    event.stopPropagation();
    markAsRead(boardId);
  };

  return (
    <>
      <Card
        onClick={handleSelectCard}
        sx={{
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          border: '1px solid',
          borderColor: selected ? '#F54E00' : '#bfc1b7',
          borderRadius: '6px',
          bgcolor: readStatus ? 'rgba(253,253,248,0.68)' : '#fdfdf8',
          boxShadow: 'none',
          transition: 'border-color 160ms ease, transform 160ms ease, background-color 160ms ease',
          '&:hover': {
            borderColor: '#F54E00',
            transform: 'translateY(-1px)',
          },
          '&:hover .post-title': {
            color: '#F54E00',
          },
        }}
      >
        <CardContent
          sx={{
            p: { xs: 1.25, sm: 1.5 },
            '&:last-child': { pb: { xs: 1.25, sm: 1.5 } },
          }}
        >
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1.25} alignItems="stretch">
              <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1, opacity: readStatus ? 0.62 : 1 }}>
                <Stack
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    label={post.site}
                    size="small"
                    sx={{
                      height: 20,
                      bgcolor: '#eeefe9',
                      color: '#23251d',
                      border: '1px solid #bfc1b7',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  />
                  <Typography variant="caption" component="span" sx={{ color: '#65675e' }}>
                    {formatRelativeTime(post.createTime)}
                  </Typography>
                </Stack>

                <Typography
                  className="post-title"
                  variant="body2"
                  component="div"
                  sx={{
                    color: '#23251d',
                    fontSize: 15,
                    fontWeight: 800,
                    lineHeight: 1.45,
                    wordBreak: 'keep-all',
                    overflowWrap: 'anywhere',
                    transition: 'color 160ms ease',
                  }}
                >
                  {post.title}
                </Typography>

                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#65675e' }}>
                    <ChatBubbleOutlineIcon sx={{ fontSize: 15 }} />
                    <Typography variant="caption" component="span" sx={{ color: 'inherit' }}>
                      {post.commentCount ?? 0}
                    </Typography>
                  </Box>
                  <Box
                    onClick={handleLike}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: '#65675e',
                      '&:hover': { color: '#F54E00' },
                    }}
                  >
                    <FavoriteBorderIcon sx={{ fontSize: 15 }} />
                    <Typography variant="caption" component="span" sx={{ color: 'inherit' }}>
                      {currentLikeCount}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

              <Box
                component="button"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setImageOpen(true);
                }}
                sx={{
                  p: 0,
                  width: { xs: 70, sm: 82 },
                  height: { xs: 70, sm: 82 },
                  border: '1px solid #bfc1b7',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  bgcolor: '#eeefe9',
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
                    objectFit: post.thumbnail ? 'cover' : 'contain',
                    p: post.thumbnail ? 0 : 1.2,
                  }}
                />
              </Box>
            </Stack>

            <Collapse in={expanded} timeout="auto">
              <Box
                sx={{
                  mt: 0.5,
                  pt: 1.25,
                  borderTop: '1px dashed #bfc1b7',
                  bgcolor: '#eeefe9',
                  mx: { xs: -1.25, sm: -1.5 },
                  mb: { xs: -1.25, sm: -1.5 },
                  px: { xs: 1.25, sm: 1.5 },
                  pb: { xs: 1.25, sm: 1.5 },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ mb: 1 }}
                >
                  <Typography
                    variant="overline"
                    component="div"
                    sx={{ color: '#23251d', fontWeight: 900, lineHeight: 1.4 }}
                  >
                    GPT 요약
                  </Typography>
                  <IconButton
                    aria-label={expanded ? 'GPT 요약 접기' : 'GPT 요약 열기'}
                    size="small"
                    onClick={handleToggleSummary}
                    sx={{
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                      border: '1px solid #bfc1b7',
                      borderRadius: '4px',
                      bgcolor: '#fdfdf8',
                      color: '#4d4f46',
                      '&:hover': {
                        bgcolor: '#f4f4f4',
                        color: '#F54E00',
                        borderColor: '#F54E00',
                      },
                    }}
                  >
                    {expanded ? <ExpandLessIcon sx={{ fontSize: 19 }} /> : <ExpandMoreIcon />}
                  </IconButton>
                </Stack>

                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    mb: 2,
                    color: summary ? '#4d4f46' : '#65675e',
                    lineHeight: 1.65,
                  }}
                >
                  {summary || '요약 내용이 없습니다.'}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Button
                    component={Link}
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleOpenSource}
                    startIcon={<LaunchIcon sx={{ fontSize: 17 }} />}
                    variant="text"
                    size="small"
                    sx={quietButtonSx}
                  >
                    원문 바로가기
                  </Button>

                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      markAsRead(boardId);
                      onCommentOpen(post);
                    }}
                    startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 17 }} />}
                    variant="text"
                    size="small"
                    sx={quietButtonSx}
                  >
                    댓글 보기
                  </Button>
                </Stack>
              </Box>
            </Collapse>
          </Stack>
        </CardContent>
      </Card>

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
        </DialogContent>
      </Dialog>
    </>
  );
}

function PostCardSkeleton() {
  return (
    <Card sx={{ border: '1px solid #bfc1b7', borderRadius: '6px', boxShadow: 'none' }}>
      <CardContent>
        <Stack direction="row" spacing={1.5}>
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

function getPostSummary(post: BoardPost) {
  if (post.gptAnswer) {
    return post.gptAnswer;
  }

  if (typeof post.contents === 'string') {
    return post.contents;
  }

  if (Array.isArray(post.contents)) {
    return post.contents
      .map((item) => (typeof item === 'object' && item && 'content' in item ? item.content : item))
      .map((item) => String(item))
      .join('\n');
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

const quietButtonSx = {
  minWidth: 0,
  px: 1.1,
  height: 34,
  borderRadius: '6px',
  border: '1px solid #bfc1b7',
  bgcolor: '#fdfdf8',
  color: '#65675e',
  fontWeight: 700,
  boxShadow: 'none',
  '&:hover': {
    bgcolor: '#f4f4f4',
    color: '#F54E00',
    borderColor: '#F54E00',
    boxShadow: 'none',
  },
};
