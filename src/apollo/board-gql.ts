import { gql } from "@apollo/client";

// export const SUMMARY_BOARD_MUTATION = gql`
//   mutation SummaryBoard($boardId: String!, $site: String!) {
//     summaryBoard(boardId: $boardId, site: $site) {
//       GPTAnswer
//       Tag
//       boardId
//       site
//     }
//   }
// `;

export const REALTIME_PAGINATION_QUERY = gql`
  query RealtimePagination($index: Int) {
    realtimePagination(index: $index) {
      boardId
      site
      title
      url
      createTime
      gptAnswer
    }
  }
`;