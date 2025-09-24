import { gql } from '@apollo/client';

// 댓글 생성
export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      Id
      boardId
      parentId
      content
      userId
      likeCount
      replyCount
      isDeleted
      createdAt
      updatedAt
    }
  }
`;

// 댓글 조회
// export const GET_COMMENTS = gql`
//   query GetComments($boardId: String!, $site: String!) {
//     comment(boardId: $boardId, site: $site) {
//       boardId
//       site
//     }
//   }
// `;
