"use client";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { PostList } from "@/components/Post/PostList";
import { gql } from "@/gql/gql";
import {
  BoardContentsByDateDocument,
  SummaryBoardMutation,
  MutationSummaryBoardArgs,
  SummaryBoardDocument,
} from "@/gql/graphql";
import { useGPTStore } from "@/stores/board";
import { ApolloError, useMutation, useQuery } from "@apollo/client";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { TemporaryDrawer } from "./Drawer/TemporaryDrawer";
import { useEffect, useRef, useState } from "react";

const REALTIME = gql(`
query BoardContentsByDate($index: String!) {
  boardContentsByDate(index: $index) {
    boardId
    site
    rank
    title
    url
    createTime
    GPTAnswer
  }
}`);

const SUMMARY_BOARD = gql(`
  mutation SummaryBoard($boardId: String!, $site: String!) {
      summaryBoard(boardId: $boardId, site: $site) {
          boardSummary
      }
  }
`);

export const ContentWrapper = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [pageIndex, setPageIndex] = useState<number>(0);
  const loadingRef = useRef(null);

  const {
    loading: boardContentsQueryLoading,
    error: boardContentsQueryError,
    data: boardContentsData,
    refetch: refetchBoardContents,
  } = useQuery(BoardContentsByDateDocument, { variables: { index: "0" } });
  const [
    summaryBoardMutation,
    {
      data: summaryBoardMutationData,
      loading: summaryBoardMutationLoading,
      error: summaryBoardMutationError,
    },
  ] = useMutation(SummaryBoardDocument, {
    refetchQueries: ["BoardContentsByDate"],
  });

  // const filteredPosts = sites.map( (site) =>  boardContentsData?.boardContentsByDate && boardContentsData.boardContentsByDate.filter((post) => post && post.site === site ));
  const handleSummaryBoard = (boardId: string, site: string) => {
    summaryBoardMutation({
      variables: { boardId: boardId, site: site },
      refetchQueries: ["BoardContentsByDate"],
      async onQueryUpdated(observableQuery) {
        await observableQuery.refetch();
      },
    });
  };
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !boardContentsQueryLoading &&
          !boardContentsQueryError
        ) {
          setPageIndex((prevPageIndex) => prevPageIndex + 1);
          refetchBoardContents({ index: (pageIndex + 1).toString() });
        }
      },
      { threshold: 0 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [boardContentsQueryLoading, boardContentsQueryError]);

  const BoardContentsQueryLoading = () => {
    return (
      <Grid
        container
        direction="column"
        width="100%"
        height={isMobile ? "calc(100vh - 56px)" : "100vh"}
        position="absolute"
        top="0"
        left="0"
        spacing={2}
        margin="0"
        justifyContent="center"
        alignItems="center"
      >
        Loading...
      </Grid>
    );
  };

  const BoardContentsQueryError = () => {
    if (boardContentsQueryError && boardContentsQueryError.message) {
      const statusCodeMatch =
        boardContentsQueryError.message.match(/\b\d{3}\b/);

      return (
        <Grid
          container
          direction="column"
          width="100%"
          height="100vh"
          top="0"
          left="0"
          spacing={2}
          margin="0"
          justifyContent="center"
          alignItems="center"
          gap="10px"
        >
          <Grid
            container
            direction="row"
            width={isMobile ? "auto" : "calc(100vh - 250px)"}
            alignItems="center"
            justifyContent="center"
            gap="10px"
          >
            <ErrorOutlineIcon color="primary" sx={{ fontSize: "80px" }} />
            <Typography variant="h3" color="primary">
              {statusCodeMatch}
            </Typography>
          </Grid>
          {isMobile ? (
            <></>
          ) : (
            <Typography
              variant="h6"
              component="div"
              color="gray"
              paragraph
              width={isMobile ? "260px" : "auto"}
              textAlign="center"
            >
              {boardContentsQueryError.message}
            </Typography>
          )}
        </Grid>
      );
    } else return null;
  };

  return (
    <>
      {boardContentsData?.boardContentsByDate && (
        <Grid
          container
          spacing={2}
          margin="0"
          height={isMobile ? "calc(100vh - 56px)" : "100vh"}
          position="relative"
          gap="2rem"
        >
          <Box flex="2">
            <PostList
              onClickCard={handleSummaryBoard}
              postItems={boardContentsData.boardContentsByDate}
            />
            <div ref={loadingRef} />
            {/* Intersection Observer 대상으로 사용될 빈 div */}
          </Box>
          <TemporaryDrawer />
        </Grid>
      )}
      {boardContentsQueryLoading && <BoardContentsQueryLoading />}
      {boardContentsQueryError && <BoardContentsQueryError />}
    </>
  );
};
