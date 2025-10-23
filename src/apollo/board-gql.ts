import { gql } from '@apollo/client';

// export const SUMMARY_BOARD_MUTATION = gql`
//   mutation SummaryBoard($boardId: String!, $site: String!) {
//     summaryBoard(boardId: $boardId, site: $site) {
//       gptAnswer
//       Tag
//       boardId
//       site
//     }
//   }
// `;

export const REALTIME_PAGINATION_QUERY = gql`
  query RealtimePagination($index: Int) {
    realtimePagination(index: $index) {
      Id
      category
      no
      site
      title
      url
      gptAnswer
      createTime
      thumbnail
      commentCount
    }
  }
`;
