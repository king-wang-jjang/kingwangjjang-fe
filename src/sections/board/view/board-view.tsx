'use client';

import type { BoardPost } from 'src/api/board-api';
import type { IBoardFilters } from 'src/types/board';

import { useState, useEffect } from 'react';

import { Box, Card, Grid, Stack, Button, useTheme, Typography, useMediaQuery } from '@mui/material';

import { useUser } from 'src/hooks/use-user';
import { useBoard } from 'src/hooks/use-board';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { useAuthStore } from 'src/store/auth-store';
// import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';

// import { Filter } from '../filter';
import { CommentDrawer, CommentSidebar } from 'src/components/comment';

import { PostList } from '../board-post-list';
import { BoardFilters } from '../board-filters';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
};

export function BoardView({ title = '실시간 인기글' }: Props) {
  const openFilters = useBoolean();
  const commentDrawerOpen = useBoolean();
  const pageTheme = useTheme();
  const isMobile = useMediaQuery(pageTheme.breakpoints.down('md'));
  const { user } = useUser();
  const { login } = useAuthStore();

  // 선택된 게시물 상태 관리
  const [selectedPost, setSelectedPost] = useState<{ boardId: string; site: string } | null>(null);

  useEffect(() => {
    if (user) {
      login(user);
    }
  }, [user, login]);

  const { postData, filterCollection, loadingRef, boardContentsQueryLoading } = useBoard();

  // 댓글 열기 핸들러
  const handleCommentOpen = (boardId: string, site: string) => {
    setSelectedPost({ boardId, site });
    if (isMobile) {
      commentDrawerOpen.onTrue();
    }
  };

  // 카드 클릭 핸들러
  const handleCardClick = (boardId: string, site: string) => {
    setSelectedPost({ boardId, site });
    if (isMobile) {
      commentDrawerOpen.onTrue();
    }
  };

  // 댓글 닫기 핸들러
  const handleCommentClose = () => {
    setSelectedPost(null);
  };

  const filters = useSetState<IBoardFilters>({
    site: [],
  });
  // const dataFiltered = applyFilter({ inputData: postData, filters: filters.state, sortBy });
  const dataFiltered = applyFilter({ inputData: postData, filters: filters.state });
  const canReset = filters.state.site.length > 0;
  const selectedSiteCount = filters.state.site.length;

  const renderFilters = (
    <Card
      sx={{
        mb: 1.5,
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
              letterSpacing: 0,
            }}
          >
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#65675e', mt: 0.25 }}>
            {dataFiltered.length.toLocaleString()}개 글을 보고 있어요
            {selectedSiteCount ? ` · 사이트 ${selectedSiteCount}개 필터 적용` : ''}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexShrink={0} justifyContent="flex-end">
          {canReset && (
            <Button
              size="small"
              onClick={filters.onResetState}
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

          <BoardFilters
            filters={filters}
            canReset={canReset}
            open={openFilters.value}
            onOpen={openFilters.onTrue}
            onClose={openFilters.onFalse}
            options={{
              site: filterCollection,
            }}
          />

          {/* <Sort sort={sortBy} onSort={handleSortBy} sortOptions={} /> */}
        </Stack>
      </Stack>
    </Card>
  );

  // Mobile
  if (isMobile) {
    return (
      <DashboardContent maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2 } }}>
        {renderFilters}
        <PostList
          onClickCard={handleCardClick}
          onCommentClick={handleCommentOpen}
          postItems={dataFiltered}
          loading={boardContentsQueryLoading}
        />
        <div ref={loadingRef} />

        {/* 모바일 댓글 Drawer */}
        {selectedPost && (
          <CommentDrawer
            open={commentDrawerOpen.value}
            onClose={() => {
              commentDrawerOpen.onFalse();
              handleCommentClose();
            }}
            postId={`${selectedPost.boardId}-${selectedPost.site}`}
            site={selectedPost.site}
            title="댓글"
          />
        )}
      </DashboardContent>
    );
  }

  // PC
  return (
    <DashboardContent maxWidth="lg" sx={{ px: { md: 3, lg: 4 } }}>
      <Grid container spacing={2} position="relative" alignItems="flex-start">
        <Grid
          item
          xs={12}
          md={8}
          sx={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {renderFilters}
          <PostList
            onClickCard={handleCardClick}
            onCommentClick={handleCommentOpen}
            postItems={dataFiltered}
            loading={boardContentsQueryLoading}
          />
          <div ref={loadingRef} />
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
          sx={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {selectedPost ? (
            <CommentSidebar
              postId={`${selectedPost.boardId}`}
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
          )}
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: BoardPost[];
  filters: IBoardFilters;
  // sortBy: string;
};

// const applyFilter = ({ inputData, filters, sortBy }: ApplyFilterProps) => {
const applyFilter = ({ inputData, filters }: ApplyFilterProps) => {
  const { site } = filters;

  // // Sort by
  // if (sortBy === 'latest') {
  //   inputData = orderBy(inputData, ['createdAt'], ['desc']);
  // }

  // if (sortBy === 'oldest') {
  //   inputData = orderBy(inputData, ['createdAt'], ['asc']);
  // }

  // if (sortBy === 'popular') {
  //   inputData = orderBy(inputData, ['totalViews'], ['desc']);
  // }

  // Filters
  if (site.length) {
    inputData = inputData.filter((board) => site.includes(board.site));
  }

  return inputData;
};
