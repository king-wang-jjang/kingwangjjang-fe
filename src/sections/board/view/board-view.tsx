'use client';

import Typography from '@mui/material/Typography';
import { Card, Grid, useTheme, useMediaQuery } from '@mui/material';

import { useBoard } from 'src/hooks/use-board';

// import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';

import { Filter } from '../filter';
// import { Filter } from '../filter';
import { Loading } from '../loading';
import { PostList } from '../PostList';
import { RealtimePost } from '../RealtimePost';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
};

export function BoardView({ title = 'Blank' }: Props) {
  const pageTheme = useTheme();
  const isMobile = useMediaQuery(pageTheme.breakpoints.down('xs'));
  const {
    postData,
    filteredPostData,
    setFilteredPostData,
    filterCollection,
    loadingRef,
    boardContentsQueryLoading,
    boardContentsQueryError,
    handleSummaryBoard,
  } = useBoard();

  if (isMobile) {
    return (
      <DashboardContent maxWidth="lg">
        <Typography variant="h4"> {title} </Typography>
        <PostList onClickCard={handleSummaryBoard} postItems={postData ?? []} />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="lg">
      <Typography variant="h4"> {title} </Typography>

      <Grid container spacing={2} position="relative">
        <Grid item xs={0} md={3}>
          {/* 왼쪽 Side */}
          <Card>
            <Filter
              setFilteredPostData={setFilteredPostData}
              postData={postData}
              filteredData={filterCollection}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <PostList onClickCard={handleSummaryBoard} postItems={filteredPostData ?? []} />
          {boardContentsQueryLoading && <Loading />}
          {/* {boardContentsQueryError && (
            <Error message={boardContentsQueryError.message} isMobile={isMobile} />
          )} */}
          <div ref={loadingRef} />
        </Grid>
        <Grid item xs={0} md={3}>
          {/* 오른쪽 Side */}
          <Card sx={{ position: 'sticky' }}>
            <RealtimePost />
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
