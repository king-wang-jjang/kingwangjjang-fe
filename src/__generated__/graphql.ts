/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Date with time (isoformat) */
  DateTime: { input: any; output: any; }
};

export type CommentEntry = {
  __typename?: 'CommentEntry';
  Id: Scalars['String']['output'];
  boardId: Scalars['String']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  isDeleted: Scalars['Boolean']['output'];
  likeCount: Scalars['Int']['output'];
  parentId?: Maybe<Scalars['String']['output']>;
  replyCount: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
  userNickname?: Maybe<Scalars['String']['output']>;
};

export type CommentList = {
  __typename?: 'CommentList';
  boardId: Scalars['String']['output'];
  comments: Array<CommentEntry>;
  totalCount: Scalars['Int']['output'];
};

export type CreateCommentInput = {
  boardId: Scalars['String']['input'];
  content: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
};

export type Daily = {
  __typename?: 'Daily';
  boardId: Scalars['String']['output'];
  createTime: Scalars['DateTime']['output'];
  gptAnswer?: Maybe<Scalars['String']['output']>;
  rank?: Maybe<Scalars['String']['output']>;
  site: Scalars['String']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type DeleteCommentInput = {
  commentId: Scalars['String']['input'];
};

export type FilterType = {
  __typename?: 'FilterType';
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type Like = {
  __typename?: 'Like';
  boardId: Scalars['String']['output'];
  likeCount: Scalars['Int']['output'];
  site: Scalars['String']['output'];
};

export type LikeCommentInput = {
  commentId: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addLike: Like;
  createComment: CommentEntry;
  createUser: UserType;
  deleteComment: Scalars['Boolean']['output'];
  likeComment: CommentEntry;
  search: Array<Realtime>;
  updateComment: CommentEntry;
};


export type MutationAddLikeArgs = {
  boardId: Scalars['String']['input'];
};


export type MutationCreateCommentArgs = {
  input: CreateCommentInput;
};


export type MutationCreateUserArgs = {
  authProvider: Scalars['String']['input'];
  nickname: Scalars['String']['input'];
  profileImage: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
};


export type MutationDeleteCommentArgs = {
  input: DeleteCommentInput;
};


export type MutationLikeCommentArgs = {
  input: LikeCommentInput;
};


export type MutationSearchArgs = {
  input: SearchInput;
};


export type MutationUpdateCommentArgs = {
  input: UpdateCommentInput;
};

export type Query = {
  __typename?: 'Query';
  comments: CommentList;
  dailyPagination: Array<Daily>;
  getUser?: Maybe<UserType>;
  getViews: View;
  me?: Maybe<UserType>;
  realtimePagination: Array<Realtime>;
};


export type QueryCommentsArgs = {
  boardId: Scalars['String']['input'];
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};


export type QueryDailyPaginationArgs = {
  index?: Scalars['Int']['input'];
};


export type QueryGetUserArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetViewsArgs = {
  boardId: Scalars['String']['input'];
  site: Scalars['String']['input'];
};


export type QueryRealtimePaginationArgs = {
  index?: Scalars['Int']['input'];
};

export type Realtime = {
  __typename?: 'Realtime';
  Id?: Maybe<Scalars['String']['output']>;
  category: Scalars['String']['output'];
  commentCount?: Maybe<Scalars['Int']['output']>;
  contents?: Maybe<Scalars['String']['output']>;
  createTime: Scalars['DateTime']['output'];
  gptAnswer?: Maybe<Scalars['String']['output']>;
  likeCount?: Maybe<Scalars['Int']['output']>;
  no: Scalars['Int']['output'];
  site: Scalars['String']['output'];
  thumbnail?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type SearchInput = {
  query: Scalars['String']['input'];
};

export type UpdateCommentInput = {
  commentId: Scalars['String']['input'];
  content: Scalars['String']['input'];
};

export type UserType = {
  __typename?: 'UserType';
  Id?: Maybe<Scalars['String']['output']>;
  authProvider?: Maybe<Scalars['String']['output']>;
  createTime: Scalars['DateTime']['output'];
  filter?: Maybe<FilterType>;
  nickname?: Maybe<Scalars['String']['output']>;
  profileImage?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type View = {
  __typename?: 'View';
  NOWVIEW: Scalars['Int']['output'];
  boardId: Scalars['String']['output'];
  site: Scalars['String']['output'];
};

export type RealtimePaginationQueryVariables = Exact<{
  index?: InputMaybe<Scalars['Int']['input']>;
}>;


export type RealtimePaginationQuery = { __typename?: 'Query', realtimePagination: Array<{ __typename?: 'Realtime', Id?: string | null, category: string, no: number, site: string, title: string, url: string, gptAnswer?: string | null, createTime: any, thumbnail?: string | null, commentCount?: number | null }> };

export type AddLikeMutationVariables = Exact<{
  boardId: Scalars['String']['input'];
}>;


export type AddLikeMutation = { __typename?: 'Mutation', addLike: { __typename?: 'Like', boardId: string, site: string, likeCount: number } };

export type CreateCommentMutationVariables = Exact<{
  input: CreateCommentInput;
}>;


export type CreateCommentMutation = { __typename?: 'Mutation', createComment: { __typename?: 'CommentEntry', Id: string } };

export type CommentsQueryVariables = Exact<{
  boardId: Scalars['String']['input'];
  page: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;


export type CommentsQuery = { __typename?: 'Query', comments: { __typename?: 'CommentList', boardId: string, totalCount: number, comments: Array<{ __typename?: 'CommentEntry', Id: string, boardId: string, parentId?: string | null, content: string, userId: string, userNickname?: string | null, likeCount: number, replyCount: number, isDeleted: boolean, createdAt: any, updatedAt: any }> } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'UserType', Id?: string | null, userId?: string | null, nickname?: string | null, authProvider?: string | null, profileImage?: string | null, createTime: any } | null };


export const RealtimePaginationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RealtimePagination"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"index"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"realtimePagination"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"index"},"value":{"kind":"Variable","name":{"kind":"Name","value":"index"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"no"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"gptAnswer"}},{"kind":"Field","name":{"kind":"Name","value":"createTime"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"}},{"kind":"Field","name":{"kind":"Name","value":"commentCount"}}]}}]}}]} as unknown as DocumentNode<RealtimePaginationQuery, RealtimePaginationQueryVariables>;
export const AddLikeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddLike"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addLike"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"boardId"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"likeCount"}}]}}]}}]} as unknown as DocumentNode<AddLikeMutation, AddLikeMutationVariables>;
export const CreateCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCommentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Id"}}]}}]}}]} as unknown as DocumentNode<CreateCommentMutation, CreateCommentMutationVariables>;
export const CommentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Comments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"boardId"}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Id"}},{"kind":"Field","name":{"kind":"Name","value":"boardId"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userNickname"}},{"kind":"Field","name":{"kind":"Name","value":"likeCount"}},{"kind":"Field","name":{"kind":"Name","value":"replyCount"}},{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<CommentsQuery, CommentsQueryVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"authProvider"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}},{"kind":"Field","name":{"kind":"Name","value":"createTime"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;