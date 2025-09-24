'use client';

import type { IBoardFilters } from 'src/types/board';
import type { RealtimePaginationQuery } from 'src/__generated__/graphql';

import { useState, useEffect } from 'react';

import { Card, Grid, Stack, Skeleton, useTheme, Typography, useMediaQuery } from '@mui/material';

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
  } = useBoard();

  // 게시물 선택 핸들러
  const handlePostSelect = (boardId: string, site: string) => {
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
    <DashboardContent maxWidth='lg'>
      <Grid container spacing={2} position="relative">
        {/* 왼쪽 사이드바 - 댓글이 선택되지 않았을 때만 표시 */}
        {!selectedPost && (
          <Grid 
            item 
            xs={12} 
            md={3}
            sx={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: selectedPost ? 'translateX(-100%)' : 'translateX(0)',
              opacity: selectedPost ? 0 : 1,
              overflow: 'hidden',
            }}
          >
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
        )}
        
        {/* PostList - 댓글이 선택되었을 때 6, 선택되지 않았을 때 5 */}
        <Grid 
          item 
          xs={12} 
          md={selectedPost ? 6 : 6}
          sx={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
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
        
        {/* 댓글 사이드바 - 댓글이 선택되었을 때 6, 선택되지 않았을 때 4 */}
        <Grid 
          item 
          xs={12} 
          md={selectedPost ? 6 : 4}
          sx={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {selectedPost ? (
            <CommentSidebar
              postId={`${selectedPost.boardId}-${selectedPost.site}`}
              site={selectedPost.site}
              currentUser="사용자"
              title="댓글"
              onClose={handleCommentClose}
            />
          ) : null}
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
