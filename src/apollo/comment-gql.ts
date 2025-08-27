import { gql } from '@apollo/client';

// 댓글 목록 조회
export const GET_COMMENTS = gql`
  query GetComments($boardId: String!, $site: String!) {
    comments(boardId: $boardId, site: $site) {
      boardId
      site
      comments {
        Id
        boardId
        site
        userId
        comment
        timestamp
        reply {
          boardId
          site
          userId
          comment
          timestamp
        }
      }
    }
  }
`;

// 댓글 추가
export const ADD_COMMENT = gql`
  mutation AddComment(
    $boardId: String!
    $site: String!
    $userId: String!
    $comment: String!
  ) {
    addComment(
      boardId: $boardId
      site: $site
      userId: $userId
      comment: $comment
    ) {
      boardId
      site
      comments {
        Id
        boardId
        site
        userId
        comment
        timestamp
        reply {
          boardId
          site
          userId
          comment
          timestamp
        }
      }
    }
  }
`;

// 대댓글 추가
export const ADD_REPLY = gql`
  mutation AddReply(
    $boardId: String!
    $site: String!
    $userId: String!
    $parentComment: String!
    $reply: String!
  ) {
    addReply(
      boardId: $boardId
      site: $site
      userId: $userId
      parentComment: $parentComment
      reply: $reply
    ) {
      Id
      boardId
      site
      userId
      comment
      timestamp
      reply {
        boardId
        site
        userId
        comment
        timestamp
      }
    }
  }
`;


