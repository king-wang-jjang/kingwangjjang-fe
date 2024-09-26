'use client';

import type { IBoardFilters } from 'src/types/board';

import Typography from '@mui/material/Typography';
import { Card, Grid, Stack, useTheme, useMediaQuery } from '@mui/material';

import { useBoard } from 'src/hooks/use-board';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

// import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';

// import { Filter } from '../filter';
import { Loading } from '../loading';
import { PostList } from '../PostList';
import { RealtimePost } from '../RealtimePost';
import { BoardFilters } from '../board-filters';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
};

export function BoardView({ title = 'Blank' }: Props) {
  const openFilters = useBoolean();
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

  const filters = useSetState<IBoardFilters>({
    site: [],
  });

  const canReset = filters.state.site.length > 0;

  if (isMobile) {
    return (
      <DashboardContent maxWidth="lg">
        <Typography variant="h4"> {title} </Typography>
        <PostList onClickCard={handleSummaryBoard} postItems={postData ?? []} />
      </DashboardContent>
    );
  }
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

  return (
    <DashboardContent maxWidth="lg">
      <Typography variant="h4"> {title} </Typography>

      <Grid container spacing={2} position="relative">
        <Grid item xs={0} md={3}>
          {/* 왼쪽 Side */}
          <Card>
            {/* <Filter
              setFilteredPostData={setFilteredPostData}
              postData={postData}
              filteredData={filterCollection}
            /> */}
          </Card>
          {renderFilters}
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
