'use client';

import type { BoardPost } from 'src/api/board-api';

import { toast } from 'sonner';
import { useMemo, useState, useEffect, useCallback } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

export function BoardView({ title = '실시간 게시판' }: Props) {
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

  const handlePostSelect = useCallback(
    (post: BoardPost) => {
      const boardId = getPostId(post);

      setSelectedPost({ boardId, site: post.site });
      if (isMobile) {
        setMobileCommentOpen(true);
      }
    },
    [isMobile]
  );

  const handleCommentOpen = useCallback(
    (post: BoardPost) => {
      handlePostSelect(post);
    },
    [handlePostSelect]
  );

  const handleCommentClose = () => {
    setSelectedPost(null);
    if (isMobile) {
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
      PaperProps={{
        sx: {
          minWidth: 240,
          bgcolor: '#fdfdf8',
          border: 1,
          borderColor: '#bfc1b7',
          boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
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

  const renderFilters = (
    <Card sx={{ bgcolor: '#eeefe9', borderColor: '#bfc1b7', borderRadius: 1 }}>
      <CardContent
        sx={{
          p: 1.25,
          '&:last-child': {
            pb: 1.25,
          },
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button
              color="inherit"
              variant="outlined"
              endIcon={
                <Badge color="secondary" variant="dot" invisible={!selectedSites.length}>
                  <FilterListIcon />
                </Badge>
              }
              onClick={(event) => setSiteMenuAnchor(event.currentTarget)}
              sx={{
                bgcolor: '#fdfdf8',
                borderColor: '#bfc1b7',
                color: '#4d4f46',
                '&:hover': {
                  bgcolor: '#f4f4f4',
                  borderColor: '#bfc1b7',
                  color: '#F54E00',
                },
              }}
            >
              사이트 필터
            </Button>

            {selectedSites.map((site) => (
              <Chip
                key={site}
                size="small"
                label={site}
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

  const renderFeedHeader = (
    <Card sx={{ bgcolor: '#fdfdf8', borderColor: '#bfc1b7', borderRadius: 1 }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5">실시간 게시판</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              수집된 게시글을 빠르게 훑고 댓글 흐름을 확인하세요.
            </Typography>
          </Box>
          <Chip
            label={`${filteredPosts.length}개 게시글`}
            size="small"
            sx={{ bgcolor: '#e5e7e0', borderColor: '#bfc1b7' }}
          />
        </Stack>
      </CardContent>
    </Card>
  );

  const renderToolPane = (
    <Card sx={{ bgcolor: '#eeefe9', borderColor: '#bfc1b7', borderRadius: 1 }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="overline" sx={{ color: '#65675e', fontWeight: 800 }}>
          Workspace
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.5, mb: 1.5 }}>
          실시간 게시판
        </Typography>

        <Box sx={{ mb: 1.5 }}>
          <SocialLoginButtons />
        </Box>

        <Divider sx={{ my: 1.5, borderColor: '#bfc1b7' }} />

        <Stack spacing={1}>
          <Typography variant="overline" sx={{ color: '#65675e', fontWeight: 800 }}>
            Sites
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            endIcon={
              <Badge color="secondary" variant="dot" invisible={!selectedSites.length}>
                <FilterListIcon />
              </Badge>
            }
            onClick={(event) => setSiteMenuAnchor(event.currentTarget)}
            sx={{
              justifyContent: 'space-between',
              bgcolor: '#fdfdf8',
              borderColor: '#bfc1b7',
              color: '#4d4f46',
              '&:hover': {
                color: '#F54E00',
                borderColor: '#bfc1b7',
                bgcolor: '#f4f4f4',
              },
            }}
          >
            사이트 필터
          </Button>

          {!!selectedSites.length && (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {selectedSites.map((site) => (
                <Chip
                  key={site}
                  size="small"
                  label={site}
                  onDelete={() => handleToggleSite(site)}
                  sx={{ bgcolor: '#e5e7e0', borderColor: '#bfc1b7' }}
                />
              ))}
            </Stack>
          )}

          {!!selectedSites.length && (
            <Button color="inherit" size="small" onClick={() => setSelectedSites([])}>
              필터 초기화
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

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
        : filteredPosts.map((post) => (
            <BoardPostCard
              key={getPostId(post)}
              post={post}
              selected={selectedPost?.boardId === getPostId(post)}
              onPostSelect={handlePostSelect}
              onCommentOpen={handleCommentOpen}
            />
          ))}

      {!initialLoading && !filteredPosts.length && (
        <Card sx={{ bgcolor: '#fdfdf8', borderColor: '#bfc1b7', borderRadius: 1 }}>
          <CardContent sx={{ py: 5, textAlign: 'center' }}>
            <Typography variant="h6">게시글이 없습니다</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              필터를 초기화하거나 새 게시글이 수집될 때까지 기다려 주세요.
            </Typography>
            {!!selectedSites.length && (
              <Button
                color="inherit"
                size="small"
                onClick={() => setSelectedSites([])}
                sx={{ mt: 1.5 }}
              >
                필터 초기화
              </Button>
            )}
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
      <Stack spacing={1.25}>
        {boardContentsQueryError && !postData.length && (
          <Alert
            severity="warning"
            sx={{ bgcolor: '#eeefe9', border: 1, borderColor: '#bfc1b7', color: '#4d4f46' }}
          >
            게시글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </Alert>
        )}

        <Box
          className="BoardWorkbench"
          sx={{
            display: { xs: 'block', md: 'grid' },
            gridTemplateColumns: selectedPost
              ? '236px minmax(0, 1fr) 360px'
              : '236px minmax(0, 1fr) 320px',
            gap: 1.5,
            alignItems: 'start',
            maxWidth: 1536,
            mx: 'auto',
          }}
        >
          <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 78 }}>
            {renderToolPane}
          </Box>

          <Stack spacing={1.25} sx={{ minWidth: 0 }}>
            {renderFeedHeader}
            {isMobile && renderFilters}
            {renderPostList}
          </Stack>

          <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 78 }}>
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
  onPostSelect: (post: BoardPost) => void;
  onCommentOpen: (post: BoardPost) => void;
};

function BoardPostCard({ post, selected, onPostSelect, onCommentOpen }: BoardPostCardProps) {
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
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                  <Stack
                    direction="row"
                    spacing={0.625}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Chip
                      label={post.site}
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

                <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ flexShrink: 0 }}>
                  {thumbnailSrc ? (
                    <Box
                      className="compact-site-marker"
                      component="button"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setImageOpen(true);
                      }}
                      sx={{
                        p: 0,
                        width: { xs: 40, sm: 44 },
                        height: { xs: 40, sm: 44 },
                        border: 1,
                        borderColor: '#bfc1b7',
                        borderRadius: 1,
                        overflow: 'hidden',
                        bgcolor: '#eeefe9',
                        cursor: 'zoom-in',
                        flexShrink: 0,
                        opacity: 0.78,
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
                      className="compact-site-marker"
                      sx={{
                        width: { xs: 40, sm: 44 },
                        height: { xs: 40, sm: 44 },
                        border: 1,
                        borderColor: '#d5d7cd',
                        borderRadius: 1,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: '#f1f2ec',
                        color: '#65675e',
                        fontSize: 13,
                        fontWeight: 750,
                        flexShrink: 0,
                      }}
                    >
                      {post.site.slice(0, 1)}
                    </Box>
                  )}
                </Stack>
              </Stack>

              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
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

                {!expanded && (
                  <Box
                    className="collapsed-expand-indicator"
                    aria-hidden="true"
                    sx={{
                      ml: 'auto',
                      width: 28,
                      height: 28,
                      display: 'grid',
                      placeItems: 'center',
                      color: '#65675e',
                      flexShrink: 0,
                    }}
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </Box>
                )}
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
                    alignItems="flex-start"
                    justifyContent="space-between"
                    sx={{ mb: 0.75 }}
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

                  <Typography
                    variant="body2"
                    color={summary ? 'text.primary' : 'text.secondary'}
                    sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}
                  >
                    {summary || '요약 내용이 없습니다.'}
                  </Typography>

                  <Stack
                    className="expanded-card-actions"
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={0.75}
                    justifyContent="flex-end"
                    sx={{ mt: 1 }}
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
        PaperProps={{
          sx: {
            boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
            borderRadius: 1,
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
