import { gql } from '@apollo/client';

// 댓글 생성
export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      Id
    }
  }
`;

// 댓글 조회
export const GET_COMMENTS = gql`
  query Comments($boardId: String!, $page: Int!, $limit: Int!) {
    comments(boardId: $boardId, page: $page, limit: $limit) {
      boardId
      totalCount
      comments {
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
  }
`;
