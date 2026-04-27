import type { Comment } from 'src/types/comment';
import type {
  CreateCommentInput,
  LikeCommentMutation,
  CreateCommentMutation,
  LikeCommentMutationVariables,
  CreateCommentMutationVariables,
} from 'src/__generated__/graphql';

import { useQuery, useMutation } from '@apollo/client';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { commentServiceClient } from 'src/apollo';
import { useAuthStore } from 'src/store/auth-store';
import { GET_COMMENTS, LIKE_COMMENT, CREATE_COMMENT } from 'src/apollo/comment-gql';

type UseCommentsParams = {
  boardId: string;
  site: string;
  enabled?: boolean;
};

export const useComments = ({ boardId, enabled = true }: UseCommentsParams) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const { user } = useAuthStore();

  const { data, loading, error, refetch } = useQuery(GET_COMMENTS, {
    client: commentServiceClient,
    variables: { boardId: `${boardId}`, page: 1, limit: 100 },
    skip: !enabled || !boardId,
    fetchPolicy: 'network-only',
  });

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
    update: (cache, { data: mutationData }) => {
      const newComment = mutationData?.createComment;
      if (!newComment) return;

      const existingData = cache.readQuery<{ comments: { comments: Comment[]; totalCount: number } }>(
        {
          query: GET_COMMENTS,
          variables: { boardId: `${boardId}`, page: 1, limit: 100 },
        }
      );

      if (existingData) {
        cache.writeQuery({
          query: GET_COMMENTS,
          variables: { boardId: `${boardId}`, page: 1, limit: 100 },
          data: {
            comments: {
              ...existingData.comments,
              comments: [newComment, ...existingData.comments.comments],
              totalCount: existingData.comments.totalCount + 1,
            },
          },
        });
      }
    },
  });

  const addComment = useCallback(
    async (content: string) => {
      if (!user) throw new Error('User not authenticated');
      try {
        const input: CreateCommentInput = { boardId: `${boardId}`, content };
        const result = await createCommentMutation({
          variables: { input },
          optimisticResponse: {
            createComment: {
              __typename: 'CommentEntry',
              Id: `optimistic-${Date.now()}`,
              boardId,
              content,
              parentId: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isDeleted: false,
              userId: user.userId,
              userNickname: user.nickname,
              likeCount: 0,
              replyCount: 0,
              isLiked: false,
            },
          },
        });
        return result.data?.createComment?.Id;
      } catch (err) {
        console.error('댓글 생성 실패:', err);
        throw err;
      }
    },
    [boardId, createCommentMutation, user]
  );

  const addReply = useCallback(
    async (parentId: string, content: string) => {
      if (!user) throw new Error('User not authenticated');
      try {
        const input: CreateCommentInput = { boardId: `${boardId}`, content, parentId };
        const result = await createCommentMutation({
          variables: { input },
          // Optimistic response for replies is more complex, skipping for now
        });
        await refetch(); // Still refetching for replies for simplicity
        return result.data?.createComment?.Id;
      } catch (err) {
        console.error('답글 생성 실패:', err);
        throw err;
      }
    },
    [boardId, createCommentMutation, user, refetch]
  );

  const [likeCommentMutation] = useMutation<LikeCommentMutation, LikeCommentMutationVariables>(
    LIKE_COMMENT,
    {
      client: commentServiceClient,
    }
  );

  const likeComment = useCallback(
    async (commentId: string) => {
      const comment = comments.find((c) => c.Id === commentId);
      if (!comment) return;
      try {
        await likeCommentMutation({
          variables: { commentId },
          optimisticResponse: {
            likeComment: {
              __typename: 'CommentEntry',
              Id: commentId,
              isLiked: !comment.isLiked,
              likeCount: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
            },
          },
        });
      } catch (err) {
        console.error('댓글 좋아요 실패:', err);
        throw err;
      }
    },
    [comments, likeCommentMutation]
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
    likeComment,
  };
};
