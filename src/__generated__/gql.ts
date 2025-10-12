/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
    "\n  query RealtimePagination($index: Int) {\n    realtimePagination(index: $index) {\n      Id\n      category\n      no\n      site\n      title\n      url\n      gptAnswer\n      createTime\n      thumbnail\n    }\n  }\n": types.RealtimePaginationDocument,
    "\n  mutation CreateComment($input: CreateCommentInput!) {\n    createComment(input: $input) {\n      Id\n    }\n  }\n": types.CreateCommentDocument,
    "\n  query Comments($boardId: String!, $page: Int!, $limit: Int!) {\n    comments(boardId: $boardId, page: $page, limit: $limit) {\n      boardId\n      totalCount\n      comments {\n        Id\n        boardId\n        parentId\n        content\n        userId\n        userNickname\n        likeCount\n        replyCount\n        isDeleted\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": types.CommentsDocument,
    "\n  query Me {\n    me {\n      Id\n      userId\n      nickname\n      authProvider\n      profileImage\n      createTime\n    }\n  }\n": types.MeDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query RealtimePagination($index: Int) {\n    realtimePagination(index: $index) {\n      Id\n      category\n      no\n      site\n      title\n      url\n      gptAnswer\n      createTime\n      thumbnail\n    }\n  }\n"): (typeof documents)["\n  query RealtimePagination($index: Int) {\n    realtimePagination(index: $index) {\n      Id\n      category\n      no\n      site\n      title\n      url\n      gptAnswer\n      createTime\n      thumbnail\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateComment($input: CreateCommentInput!) {\n    createComment(input: $input) {\n      Id\n    }\n  }\n"): (typeof documents)["\n  mutation CreateComment($input: CreateCommentInput!) {\n    createComment(input: $input) {\n      Id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Comments($boardId: String!, $page: Int!, $limit: Int!) {\n    comments(boardId: $boardId, page: $page, limit: $limit) {\n      boardId\n      totalCount\n      comments {\n        Id\n        boardId\n        parentId\n        content\n        userId\n        userNickname\n        likeCount\n        replyCount\n        isDeleted\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query Comments($boardId: String!, $page: Int!, $limit: Int!) {\n    comments(boardId: $boardId, page: $page, limit: $limit) {\n      boardId\n      totalCount\n      comments {\n        Id\n        boardId\n        parentId\n        content\n        userId\n        userNickname\n        likeCount\n        replyCount\n        isDeleted\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Me {\n    me {\n      Id\n      userId\n      nickname\n      authProvider\n      profileImage\n      createTime\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      Id\n      userId\n      nickname\n      authProvider\n      profileImage\n      createTime\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;