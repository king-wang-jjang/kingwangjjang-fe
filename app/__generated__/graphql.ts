/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: { input: any; output: any };
};

export type BoardSummaryType = {
  __typename?: "BoardSummaryType";
  GPTAnswer?: Maybe<Scalars["String"]["output"]>;
  boardId?: Maybe<Scalars["String"]["output"]>;
  createTime?: Maybe<Scalars["DateTime"]["output"]>;
  rank?: Maybe<Scalars["String"]["output"]>;
  site?: Maybe<Scalars["String"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
  url?: Maybe<Scalars["String"]["output"]>;
};

export type DailyType = {
  __typename?: "DailyType";
  GPTAnswer?: Maybe<Scalars["String"]["output"]>;
  boardId?: Maybe<Scalars["String"]["output"]>;
  createTime?: Maybe<Scalars["DateTime"]["output"]>;
  rank?: Maybe<Scalars["String"]["output"]>;
  site?: Maybe<Scalars["String"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
  url?: Maybe<Scalars["String"]["output"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  summaryBoard?: Maybe<SummaryBoardMutation>;
};

export type MutationSummaryBoardArgs = {
  boardId: Scalars["String"]["input"];
  site: Scalars["String"]["input"];
};

export type Query = {
  __typename?: "Query";
  allDaily?: Maybe<Array<Maybe<DailyType>>>;
  allRealtime?: Maybe<Array<Maybe<RealTimeType>>>;
  boardContentsByDate?: Maybe<Array<Maybe<BoardSummaryType>>>;
};

export type QueryBoardContentsByDateArgs = {
  index: Scalars["String"]["input"];
};

export type RealTimeType = {
  __typename?: "RealTimeType";
  GPTAnswer?: Maybe<Scalars["String"]["output"]>;
  boardId?: Maybe<Scalars["String"]["output"]>;
  createTime?: Maybe<Scalars["DateTime"]["output"]>;
  site?: Maybe<Scalars["String"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
  url?: Maybe<Scalars["String"]["output"]>;
};

export type SummaryBoardMutation = {
  __typename?: "SummaryBoardMutation";
  boardSummary?: Maybe<Scalars["String"]["output"]>;
};

export type BoardContentsByDateQueryVariables = Exact<{
  index: Scalars["String"]["input"];
}>;

export type BoardContentsByDateQuery = {
  __typename?: "Query";
  boardContentsByDate?: Array<{
    __typename?: "BoardSummaryType";
    boardId?: string | null;
    site?: string | null;
    rank?: string | null;
    title?: string | null;
    url?: string | null;
    createTime?: any | null;
    GPTAnswer?: string | null;
  } | null> | null;
};

export type SummaryBoardMutationVariables = Exact<{
  boardId: Scalars["String"]["input"];
  site: Scalars["String"]["input"];
}>;

// export type SummaryBoardMutation = { __typename?: 'Mutation', summaryBoard?: { __typename?: 'SummaryBoardMutation', boardSummary?: string | null } | null };

export const BoardContentsByDateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "BoardContentsByDate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "index" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "boardContentsByDate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "index" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "index" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "boardId" } },
                { kind: "Field", name: { kind: "Name", value: "site" } },
                { kind: "Field", name: { kind: "Name", value: "rank" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "createTime" } },
                { kind: "Field", name: { kind: "Name", value: "GPTAnswer" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  BoardContentsByDateQuery,
  BoardContentsByDateQueryVariables
>;
export const SummaryBoardDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SummaryBoard" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "boardId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "site" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "summaryBoard" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "boardId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "boardId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "site" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "site" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "boardSummary" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SummaryBoardMutation,
  SummaryBoardMutationVariables
>;
