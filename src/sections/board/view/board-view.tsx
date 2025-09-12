'use client';

import type { IBoardFilters } from 'src/types/board';
import type { RealtimePaginationQuery } from 'src/__generated__/graphql';

import { useEffect, useState } from 'react';

import { Grid, Stack, useTheme, useMediaQuery, Skeleton, Card, Typography } from '@mui/material';

import { useUser } from 'src/hooks/use-user';
import { useBoard } from 'src/hooks/use-board';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { useAuthStore } from 'src/store/auth-store';
// import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';

// import { Filter } from '../filter';
import { PostList } from '../board-post-list';
import { BoardFilters } from '../board-filters';
import { BoardFiltersResult } from '../board-filters-result';
import { CommentSidebar, CommentDrawer } from 'src/components/comment';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
};

export function BoardView({ title = 'Blank' }: Props) {
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

  const {
    postData,
    filterCollection,
    loadingRef,
    boardContentsQueryLoading,
    boardContentsQueryError,
    handleSummaryBoard,
  } = useBoard();

  // 게시물 선택 핸들러
  const handlePostSelect = (boardId: string, site: string) => {
    setSelectedPost({ boardId, site });
    if (isMobile) {
      commentDrawerOpen.onTrue();
    }
  };

  const filters = useSetState<IBoardFilters>({
    site: [],
  });
  // const dataFiltered = applyFilter({ inputData: postData, filters: filters.state, sortBy });
  const dataFiltered = applyFilter({ inputData: postData, filters: filters.state });
  const canReset = filters.state.site.length > 0;
  const renderResults = <BoardFiltersResult filters={filters} totalResults={dataFiltered.length} />;
  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
    >
      {/* <Search search={search} onSearch={handleSearch} /> */}

      <Stack direction="row" spacing={1} flexShrink={0}>
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
  );

  // Mobile
  if (isMobile) {
    return (
      <DashboardContent maxWidth="lg">
        {renderFilters}
        {canReset}
        <PostList 
          onClickCard={handlePostSelect} 
          onCommentClick={handlePostSelect}
          postItems={dataFiltered} 
          loading={boardContentsQueryLoading} 
        />
        <div ref={loadingRef} />
        
        {/* 모바일 댓글 Drawer */}
        {selectedPost && (
          <CommentDrawer
            open={commentDrawerOpen.value}
            onClose={commentDrawerOpen.onFalse}
            postId={`${selectedPost.boardId}-${selectedPost.site}`}
            site={selectedPost.site}
            currentUser="사용자"
            title="댓글"
          />
        )}
      </DashboardContent>
    );
  }

  // PC
  return (
    <DashboardContent maxWidth={isMobile ? "lg" : false}>
      <Grid container spacing={2} position="relative">
        <Grid item xs={12} md={4}>
          {/* 왼쪽 Side */}
          {/* <Card
            sx={{
              width: '100%',
              position: 'relative',
              display: isMobile ? 'none' : 'flex',
              justifyContent: 'center',
              padding: '15px 0',
            }}
          >
            <SocialLoginButtons />
          </Card> */}
        </Grid>
        <Grid item xs={12} md={5}>
          {renderFilters}
          {canReset}
          <PostList 
            onClickCard={handlePostSelect} 
            onCommentClick={handlePostSelect}
            postItems={dataFiltered} 
            loading={boardContentsQueryLoading} 
          />
          <Skeleton/>
          {/* {boardContentsQueryLoading && <Loading />} */}
          {/* {boardContentsQueryError && (
            <Error message={boardContentsQueryError.message} isMobile={isMobile} />
          )} */}
          <div ref={loadingRef} />
        </Grid>
        <Grid item xs={12} md={3}>
          {/* 오른쪽 댓글 사이드바 */}
          {selectedPost ? (
            <CommentSidebar
              postId={`${selectedPost.boardId}-${selectedPost.site}`}
              site={selectedPost.site}
              currentUser="사용자"
              title="댓글"
            />
          ) : (
            <Card sx={{ position: 'sticky', top: '80px', p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                게시물을 선택하면 댓글을 볼 수 있습니다
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
  inputData: RealtimePaginationQuery['realtimePagination'];
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
