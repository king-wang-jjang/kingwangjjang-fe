import { gql } from "@apollo/client";

// const DAILY_PAGINATION_QUERY = gql`
//   query DailyPagination($index: Int) {
//     dailyPagination(index: $index) {
//       GPTAnswer
//       boardId
//       createTime
//       rank
//       site
//       title
//       url
//     }
//   }
// `;

const SUMMARY_BOARD_MUTATION = gql`
  mutation SummaryBoard($boardId: String!, $site: String!) {
    summaryBoard(boardId: $boardId, site: $site) {
      GPTAnswer
      Tag
      boardId
      site
    }
  }
`;

const REALTIME_PAGINATION_QUERY = gql`
  query RealtimePagination($index: Int) {
    realtimePagination(index: $index) {
      boardId
      rank
      site
      title
      url
      createTime
      GPTAnswer
    }
  }
`;