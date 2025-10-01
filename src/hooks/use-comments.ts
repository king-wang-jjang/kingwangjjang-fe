import type { CreateCommentInput, CreateCommentMutation, CreateCommentMutationVariables } from 'src/__generated__/graphql';

import { useMemo, useCallback } from 'react';
import { useMutation } from '@apollo/client';

import { commentServiceClient } from 'src/apollo';
import { CREATE_COMMENT } from 'src/apollo/comment-gql';

type UseCommentsParams = {
  boardId: string;
  site: string;
  currentUserId: string;
  enabled?: boolean;
};

export const useComments = ({ boardId}: UseCommentsParams) => {
  // 댓글 조회는 현재 주석 처리된 상태이므로 임시로 빈 배열 반환
  const comments = useMemo(() => [], []);

  const [createCommentMutation, { loading: creatingComment }] = useMutation<
    CreateCommentMutation,
    CreateCommentMutationVariables
  >(CREATE_COMMENT, {
    client: commentServiceClient,
  });

  const addComment = useCallback(
    async (content: string) => {
      try {
        const input: CreateCommentInput = {
          boardId: `${boardId}`,
          content,
          parentId: null,
        };
        const result = await createCommentMutation({
          variables: { input },
        });
        return result.data?.createComment;
      } catch (error) {
        console.error('댓글 생성 실패:', error);
        throw error;
      }
    },
    [boardId, createCommentMutation]
  );

  const addReply = useCallback(
    async (parentId: string, content: string) => {
      try {
        const input: CreateCommentInput = {
          boardId: `${boardId}`,
          content,
          parentId,
        };
        const result = await createCommentMutation({
          variables: { input },
        });
        return result.data?.createComment;
      } catch (error) {
        console.error('답글 생성 실패:', error);
        throw error;
      }
    },
    [boardId, createCommentMutation]
  );

  return {
    comments,
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
    creatingComment,
    addComment,
    addReply,
  };
};


