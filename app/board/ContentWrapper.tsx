'use client'
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { PostList } from "@/components/Post/PostList";
import { SummaryBoardDocument, RealtimePaginationQuery } from "@/gql/graphql";
import { useMutation, useQuery } from "@apollo/client";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { Loading } from "./Loading";
import { Error } from "./Error";
import { RealtimePost } from "@/components/Post/RealtimePost";
import { Filter } from "./Filter";
import { FilterCollectionType } from "@/types/board-type";
import useInfiniteScrollablePostList from "../hooks/useInfiniteScrollablePostList";

export const ContentWrapper = () => {
  const pageTheme = useTheme();
  const [postData, setPostData] = useState<RealtimePaginationQuery['realtimePagination']>();
  const [fiteredPostData, setFiteredPostData] = useState<RealtimePaginationQuery['realtimePagination']>();
  const isMobile = useMediaQuery(pageTheme.breakpoints.down("xs"));
  const [filterCollection, setFilterCollection] = useState<FilterCollectionType>();
  const {loadingRef, loading: boardContentsQueryLoading, error: boardContentsQueryError, data: boardContentsData} 
  = useInfiniteScrollablePostList();

  const [ summaryBoardMutation, { data: summaryBoardMutationData, loading: summaryBoardMutationLoading, error: summaryBoardMutationError,},]
  = useMutation(SummaryBoardDocument, { refetchQueries: ["BoardContentsByDate"] });
  
  const handleSummaryBoard = (boardId: string, site: string) => {
    summaryBoardMutation({
      variables: { boardId: boardId, site: site },
      refetchQueries: ['BoardContentsByDate'],
      async onQueryUpdated(observableQuery) {
          await observableQuery.refetch();
      },
    });
  }

  useEffect(()=>{
    // Site이름을 영어 -> 한글
    const modifiedData = (boardContentsData?.realtimePagination)?.map((value) => {
      if (value?.site === "ygosu") {
        return { ...value, site: "와이고수" };
      } else if (value?.site === "dcinside") {
        return { ...value, site: "디시인사이드" };
      } else if (value?.site === "ppomppu") {
        return { ...value, site: "뽐뿌" };
      }
      return value;
    });

    setPostData(modifiedData);
    setFiteredPostData(modifiedData);

    const uniqueSite = Array.from(new Set(
      modifiedData
        ? modifiedData.map((item) => item?.site).filter(site => typeof site === 'string').map(String)
        : []
    )); 
    
    if (uniqueSite !== undefined) {
      setFilterCollection({ site: uniqueSite });
    }
  },[boardContentsData])

  if(isMobile) return boardContentsData?.realtimePagination && <PostList onClickCard={handleSummaryBoard} postItems={postData ?? []} />
  
  return(
    <>
    <Grid container spacing={2} margin={0} paddingY="0"
          position="relative" >
      <Grid xs={0} md={3} paddingY="0" > 
        {/* 왼쪽 Side */}
        <Box width="100%" bgcolor="white" position="sticky" top="73px" >
          <Filter setFilteredPostData={setFiteredPostData} postData={postData} filteredData={filterCollection} />
        </Box>
      </Grid>
      <Grid xs={12} md={6}>
        <PostList onClickCard={handleSummaryBoard} postItems={fiteredPostData ?? []} />
        {boardContentsQueryLoading && <Loading />}
        {boardContentsQueryError && <Error message={boardContentsQueryError.message} isMobile={isMobile} />}
        <div ref={loadingRef}/>
      </Grid>
      <Grid xs={0} md={3} paddingY="0" >
        {/* 오른쪽 Side */}
        <Box width="100%" bgcolor="white" position="sticky" top="73px" >
          <RealtimePost/>
        </Box>
      </Grid>
    </Grid>
   </>
  );
};
