import type { Comment } from 'src/types/comment';
import type {
  CreateCommentInput,
  CreateCommentMutation,
  CreateCommentMutationVariables,
} from 'src/__generated__/graphql';

import { useQuery, useMutation } from '@apollo/client';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { commentServiceClient } from 'src/apollo';
import { GET_COMMENTS, CREATE_COMMENT } from 'src/apollo/comment-gql';

type UseCommentsParams = {
  boardId: string;
  site: string;
  currentUserId: string;
  enabled?: boolean;
};

export const useComments = ({ boardId, enabled = true }: UseCommentsParams) => {
  const [comments, setComments] = useState<Comment[]>([]);

  // 댓글 조회 쿼리
  const { data, loading, error, refetch } = useQuery(GET_COMMENTS, {
    client: commentServiceClient,
    variables: {
      boardId: `${boardId}`,
      page: 1,
      limit: 100,
    },
    skip: !enabled || !boardId,
    fetchPolicy: 'network-only',
  });

  // 쿼리 결과가 변경되면 comments 상태 업데이트
  useEffect(() => {
    if (data?.comments?.comments) {
      setComments(data.comments.comments);
    }
  }, [data]);

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
        };
        const result = await createCommentMutation({
          variables: { input },
        });
        console.log('Mutation result:', result);
        console.log('createComment data:', result.data?.createComment);
        console.log('Id:', result.data?.createComment?.Id);

        // 댓글 추가 후 목록 갱신
        await refetch();

        return result.data?.createComment?.Id;
      } catch (err) {
        console.error('댓글 생성 실패:', err);
        throw err;
      }
    },
    [boardId, createCommentMutation, refetch]
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

        // 답글 추가 후 목록 갱신
        await refetch();

        return result.data?.createComment?.Id;
      } catch (err) {
        console.error('답글 생성 실패:', err);
        throw err;
      }
    },
    [boardId, createCommentMutation, refetch]
  );

  const totalCount = useMemo(() => data?.comments?.totalCount ?? 0, [data]);

  return {
    comments,
    totalCount,
    loading,
    error,
    refetch,
    creatingComment,
    addComment,
    addReply,
  };
};
