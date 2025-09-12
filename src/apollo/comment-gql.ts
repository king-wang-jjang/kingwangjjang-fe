import { gql } from '@apollo/client';

// 댓글 조회 (Board Service의 실제 스키마에 맞춤)
export const GET_COMMENTS = gql`
  query GetComment($boardId: String!, $site: String!) {
    comment(boardId: $boardId, site: $site) {
      boardId
      site
    }
  }
`;

// Board Service에는 addComment, addReply 필드가 없으므로 주석 처리
// export const ADD_COMMENT = gql`
//   mutation AddComment($boardId: String!, $site: String!, $userId: String!, $comment: String!) {
//     addComment(boardId: $boardId, site: $site, userId: $userId, comment: $comment) {
//       boardId
//       site
//       comments {
//         Id
//         boardId
//         site
//         userId
//         comment
//         timestamp
//         reply {
//           boardId
//           site
//           userId
//           comment
//           timestamp
//         }
//       }
//     }
//   }
// `;

// export const ADD_REPLY = gql`
//   mutation AddReply(
//     $boardId: String!
//     $site: String!
//     $userId: String!
//     $parentComment: String!
//     $reply: String!
//   ) {
//     addReply(
//       boardId: $boardId
//       site: $site
//       userId: $userId
//       parentComment: $parentComment
//       reply: $reply
//     ) {
//       Id
//       boardId
//       site
//       userId
//       comment
//       timestamp
//       reply {
//         boardId
//         site
//         userId
//         comment
//         timestamp
//       }
//     }
//   }
// `;
