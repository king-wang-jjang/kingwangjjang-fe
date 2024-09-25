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

export type Daily = {
  __typename?: 'Daily';
  GPTAnswer?: Maybe<Scalars['String']['output']>;
  boardId: Scalars['String']['output'];
  createTime: Scalars['DateTime']['output'];
  rank?: Maybe<Scalars['String']['output']>;
  site: Scalars['String']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  summaryBoard: Summary;
};


export type MutationSummaryBoardArgs = {
  boardId: Scalars['String']['input'];
  site: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  dailyPagination: Array<Daily>;
  realtimePagination: Array<RealTime>;
};


export type QueryDailyPaginationArgs = {
  index?: Scalars['Int']['input'];
};


export type QueryRealtimePaginationArgs = {
  index?: Scalars['Int']['input'];
};

export type RealTime = {
  __typename?: 'RealTime';
  GPTAnswer?: Maybe<Scalars['String']['output']>;
  boardId: Scalars['String']['output'];
  createTime: Scalars['DateTime']['output'];
  rank?: Maybe<Scalars['String']['output']>;
  site: Scalars['String']['output'];
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type Summary = {
  __typename?: 'Summary';
  GPTAnswer: Scalars['String']['output'];
  Tag: Array<Scalars['String']['output']>;
  boardId: Scalars['String']['output'];
  site: Scalars['String']['output'];
};

export type SummaryBoardMutationVariables = Exact<{
  boardId: Scalars['String']['input'];
  site: Scalars['String']['input'];
}>;


export type SummaryBoardMutation = { __typename?: 'Mutation', summaryBoard: { __typename?: 'Summary', GPTAnswer: string, Tag: Array<string>, boardId: string, site: string } };

export type RealtimePaginationQueryVariables = Exact<{
  index?: InputMaybe<Scalars['Int']['input']>;
}>;


export type RealtimePaginationQuery = { __typename?: 'Query', realtimePagination: Array<{ __typename?: 'RealTime', boardId: string, rank?: string | null, site: string, title: string, url: string, createTime: any, GPTAnswer?: string | null }> };


export const SummaryBoardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SummaryBoard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"site"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"summaryBoard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"boardId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"boardId"}}},{"kind":"Argument","name":{"kind":"Name","value":"site"},"value":{"kind":"Variable","name":{"kind":"Name","value":"site"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"GPTAnswer"}},{"kind":"Field","name":{"kind":"Name","value":"Tag"}},{"kind":"Field","name":{"kind":"Name","value":"boardId"}},{"kind":"Field","name":{"kind":"Name","value":"site"}}]}}]}}]} as unknown as DocumentNode<SummaryBoardMutation, SummaryBoardMutationVariables>;
export const RealtimePaginationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RealtimePagination"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"index"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"realtimePagination"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"index"},"value":{"kind":"Variable","name":{"kind":"Name","value":"index"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"boardId"}},{"kind":"Field","name":{"kind":"Name","value":"rank"}},{"kind":"Field","name":{"kind":"Name","value":"site"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createTime"}},{"kind":"Field","name":{"kind":"Name","value":"GPTAnswer"}}]}}]}}]} as unknown as DocumentNode<RealtimePaginationQuery, RealtimePaginationQueryVariables>;