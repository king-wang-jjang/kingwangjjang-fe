'use client';

import type { IBoardFilters } from 'src/types/board';
import type { RealtimePaginationQuery } from 'src/__generated__/graphql';

import { Grid, Stack, useTheme, useMediaQuery } from '@mui/material';

import { useBoard } from 'src/hooks/use-board';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

// import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';

// import { Filter } from '../filter';
import { PostList } from '../board-post-list';
import { BoardFilters } from '../board-filters';
import { BoardFiltersResult } from '../board-filters-result';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
};

export function BoardView({ title = 'Blank' }: Props) {
  const openFilters = useBoolean();
  const pageTheme = useTheme();
  const isMobile = useMediaQuery(pageTheme.breakpoints.down('md'));
  const {
    postData,
    filterCollection,
    loadingRef,
    boardContentsQueryLoading,
    boardContentsQueryError,
    handleSummaryBoard,
  } = useBoard();

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
        <PostList onClickCard={handleSummaryBoard} postItems={dataFiltered} />
        <div ref={loadingRef} />
      </DashboardContent>
    );
  }

  // PC
  return (
    <DashboardContent maxWidth="lg">
      <Grid container spacing={2} position="relative">
        <Grid item md={3}>
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
        <Grid md={6}>
          {renderFilters}
          {canReset}
          <PostList onClickCard={handleSummaryBoard} postItems={dataFiltered} />
          {/* {boardContentsQueryLoading && <Loading />} */}
          {/* {boardContentsQueryError && (
            <Error message={boardContentsQueryError.message} isMobile={isMobile} />
          )} */}
          <div ref={loadingRef} />
        </Grid>
        <Grid item xs={0} md={3}>
          {/* 오른쪽 Side */}
          {/* <Card sx={{ position: 'sticky', top: '64px' }}>
            <RealtimePost />
          </Card> */}
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
