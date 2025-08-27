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

export type Comment = {
  __typename?: 'Comment';
  boardId: Scalars['String']['output'];
  comments: Array<CommentEntry>;
  site: Scalars['String']['output'];
};

export type CommentEntry = {
  __typename?: 'CommentEntry';
  Id: Scalars['String']['output'];
  boardId: Scalars['String']['output'];
  comment: Scalars['String']['output'];
  reply: Array<ReplyEntry>;
  site: Scalars['String']['output'];
  timestamp: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
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

export type FilterType = {
  __typename?: 'FilterType';
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type Like = {
  __typename?: 'Like';
  NOWLIKE: Scalars['Int']['output'];
  boardId: Scalars['String']['output'];
  site: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addComment: Comment;
  addReply: CommentEntry;
  createUser: UserType;
  search: Array<Realtime>;
};


export type MutationAddCommentArgs = {
  boardId: Scalars['String']['input'];
  comment: Scalars['String']['input'];
  site: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationAddReplyArgs = {
  boardId: Scalars['String']['input'];
  parentComment: Scalars['String']['input'];
  reply: Scalars['String']['input'];
  site: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationCreateUserArgs = {
  authOrganization: Scalars['String']['input'];
  nickname: Scalars['String']['input'];
  profileImage: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
};


export type MutationSearchArgs = {
  input: SearchInput;
};

export type Query = {
  __typename?: 'Query';
  comment: Comment;
  comments: Comment;
  dailyPagination: Array<Daily>;
  getLike: Like;
  getUser?: Maybe<UserType>;
  getViews: View;
  realtimePagination: Array<Realtime>;
};


export type QueryCommentArgs = {
  boardId: Scalars['String']['input'];
  site: Scalars['String']['input'];
};


export type QueryCommentsArgs = {
  boardId: Scalars['String']['input'];
  site: Scalars['String']['input'];
};


export type QueryDailyPaginationArgs = {
  index?: Scalars['Int']['input'];
};


export type QueryGetLikeArgs = {
  boardId: Scalars['String']['input'];
  site: Scalars['String']['input'];
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
  boardId: Array<Scalars['String']['output']>;
  contents?: Maybe<Scalars['String']['output']>;
  createTime: Scalars['DateTime']['output'];
  gptAnswer?: Maybe<Scalars['String']['output']>;
  site: Scalars['String']['output'];
  thumbnail?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type ReplyEntry = {
  __typename?: 'ReplyEntry';
  boardId: Scalars['String']['output'];
  comment: Scalars['String']['output'];
  site: Scalars['String']['output'];
  timestamp: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type SearchInput = {
  query: Scalars['String']['input'];
};

export type UserType = {
  __typename?: 'UserType';
  Id?: Maybe<Scalars['String']['output']>;
  authOrganization?: Maybe<Scalars['String']['output']>;
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


export type RealtimePaginationQuery = { __typename?: 'Query', realtimePagination: Array<{ __typename?: 'Realtime', boardId: Array<string>, site: string, title: string, url: string, createTime: any, gptAnswer?: string | null, thumbnail?: string | null }> };

export type GetCommentsQueryVariables = Exact<{
  boardId: Scalars['String']['input'];
  site: Scalars['String']['input'];
}>;


export type GetCommentsQuery = { __typename?: 'Query', comments: { __typename?: 'Comment', boardId: string, site: string, comments: Array<{ __typename?: 'CommentEntry', Id: string, boardId: string, site: string, userId: string, comment: string, timestamp: any, reply: Array<{ __typename?: 'ReplyEntry', boardId: string, site: string, userId: string, comment: string, timestamp: any }> }> } };

export type AddCommentMutationVariables = Exact<{
  boardId: Scalars['String']['input'];
  site: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  comment: Scalars['String']['input'];
}>;


export type AddCommentMutation = { __typename?: 'Mutation', addComment: { __typename?: 'Comment', boardId: string, site: string, comments: Array<{ __typename?: 'CommentEntry', Id: string, boardId: string, site: string, userId: string, comment: string, timestamp: any, reply: Array<{ __typename?: 'ReplyEntry', boardId: string, site: string, userId: string, comment: string, timestamp: any }> }> } };

export type AddReplyMutationVariables = Exact<{
  boardId: Scalars['String']['input'];
  site: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  parentComment: Scalars['String']['input'];
  reply: Scalars['String']['input'];
}>;


export type AddReplyMutation = { __typename?: 'Mutation', addReply: { __typename?: 'CommentEntry', Id: string, boardId: string, site: string, userId: string, comment: string, timestamp: any, reply: Array<{ __typename?: 'ReplyEntry', boardId: string, site: string, userId: string, comment: string, timestamp: any }> } };

export type GetUserQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetUserQuery = { __typename?: 'Query', getUser?: { __typename?: 'UserType', Id?: string | null, authOrganization?: string | null, createTime: any, nickname?: string | null, profileImage?: string | null, userId?: string | null } | null };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', getUser?: { __typename?: 'UserType', Id?: string | null, authOrganization?: string | null, createTime: any, nickname?: string | null, profileImage?: string | null, userId?: string | null } | null };


export const RealtimePaginationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RealtimePagination"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"index"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"realtimePagination"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"index"},"value":{"kind":"Variable","name":{"kind":"Name","value":"index"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"boardId"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createTime"}},{"kind":"Field","name":{"kind":"Name","value":"gptAnswer"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnail"}}]}}]}}]} as unknown as DocumentNode<RealtimePaginationQuery, RealtimePaginationQueryVariables>;
export const GetCommentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetComments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"site"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}},{"kind":"Argument","name":{"kind":"Name","value":"site"},"value":{"kind":"Variable","name":{"kind":"Name","value":"site"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"boardId"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Id"}},{"kind":"Field","name":{"kind":"Name","value":"boardId"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"reply"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"boardId"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetCommentsQuery, GetCommentsQueryVariables>;
export const AddCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"site"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"comment"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}},{"kind":"Argument","name":{"kind":"Name","value":"site"},"value":{"kind":"Variable","name":{"kind":"Name","value":"site"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"comment"},"value":{"kind":"Variable","name":{"kind":"Name","value":"comment"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"boardId"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Id"}},{"kind":"Field","name":{"kind":"Name","value":"boardId"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"reply"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"boardId"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AddCommentMutation, AddCommentMutationVariables>;
export const AddReplyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddReply"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"site"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"parentComment"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reply"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addReply"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}},{"kind":"Argument","name":{"kind":"Name","value":"site"},"value":{"kind":"Variable","name":{"kind":"Name","value":"site"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"parentComment"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parentComment"}}},{"kind":"Argument","name":{"kind":"Name","value":"reply"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reply"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Id"}},{"kind":"Field","name":{"kind":"Name","value":"boardId"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"reply"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"boardId"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]}}]} as unknown as DocumentNode<AddReplyMutation, AddReplyMutationVariables>;
export const GetUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Id"}},{"kind":"Field","name":{"kind":"Name","value":"authOrganization"}},{"kind":"Field","name":{"kind":"Name","value":"createTime"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}}]}}]} as unknown as DocumentNode<GetUserQuery, GetUserQueryVariables>;
export const GetMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"Id"}},{"kind":"Field","name":{"kind":"Name","value":"authOrganization"}},{"kind":"Field","name":{"kind":"Name","value":"createTime"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"profileImage"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}}]}}]} as unknown as DocumentNode<GetMeQuery, GetMeQueryVariables>;