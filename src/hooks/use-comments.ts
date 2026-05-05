import type { Comment } from 'src/types/comment';
import type { CommentListResponse } from 'src/api/comment-api';

import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from 'src/store/auth-store';
import {
  getComments,
  likeComment as likeCommentRequest,
  createComment as createCommentRequest,
} from 'src/api/comment-api';

type UseCommentsParams = {
  boardId: string;
  site: string;
  enabled?: boolean;
};

const EMPTY_COMMENTS: Comment[] = [];

function updateCommentById(comments: Comment[], updated: Comment) {
  return comments.map((comment) => (comment.Id === updated.Id ? { ...comment, ...updated } : comment));
}

export const useComments = ({ boardId, enabled = true }: UseCommentsParams) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const queryKey = useMemo(() => ['comments', boardId] as const, [boardId]);

  const commentsQuery = useQuery({
    queryKey,
    queryFn: () => getComments(`${boardId}`, 1, 100),
    enabled: enabled && Boolean(boardId),
  });

  const createCommentMutation = useMutation({
    mutationFn: createCommentRequest,
  });

  const likeCommentMutation = useMutation({
    mutationFn: likeCommentRequest,
  });

  const comments = commentsQuery.data?.comments ?? EMPTY_COMMENTS;
  const totalCount = commentsQuery.data?.totalCount ?? 0;

  const addComment = useCallback(
    async (content: string) => {
      if (!user) throw new Error('User not authenticated');

      const created = await createCommentMutation.mutateAsync({ boardId: `${boardId}`, content });
      queryClient.setQueryData<CommentListResponse>(queryKey, (current) => ({
        boardId: current?.boardId ?? `${boardId}`,
        totalCount: (current?.totalCount ?? 0) + 1,
        comments: [created, ...(current?.comments ?? EMPTY_COMMENTS)],
      }));

      return created.Id;
    },
    [boardId, createCommentMutation, queryClient, queryKey, user]
  );

  const addReply = useCallback(
    async (parentId: string, content: string) => {
      if (!user) throw new Error('User not authenticated');

      const created = await createCommentMutation.mutateAsync({ boardId: `${boardId}`, parentId, content });
      await queryClient.invalidateQueries({ queryKey });

      return created.Id;
    },
    [boardId, createCommentMutation, queryClient, queryKey, user]
  );

  const likeComment = useCallback(
    async (commentId: string) => {
      const result = await likeCommentMutation.mutateAsync(commentId);
      queryClient.setQueryData<CommentListResponse>(queryKey, (current) =>
        current
          ? {
              ...current,
              comments: updateCommentById(current.comments, result),
            }
          : current
      );
    },
    [likeCommentMutation, queryClient, queryKey]
  );

  const memoizedTotalCount = useMemo(() => totalCount, [totalCount]);

  return {
    comments,
    totalCount: memoizedTotalCount,
    loading: commentsQuery.isLoading,
    error: commentsQuery.error,
    refetch: commentsQuery.refetch,
    creatingComment: createCommentMutation.isPending,
    addComment,
    addReply,
    likeComment,
  };
};
