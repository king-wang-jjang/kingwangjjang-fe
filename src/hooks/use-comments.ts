import type { Comment } from 'src/types/comment';

import { useMemo, useState, useEffect, useCallback } from 'react';

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

export const useComments = ({ boardId, enabled = true }: UseCommentsParams) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [creatingComment, setCreatingComment] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthStore();

  const refetch = useCallback(async () => {
    if (!enabled || !boardId) return;

    setLoading(true);
    try {
      const data = await getComments(`${boardId}`, 1, 100);
      setComments(data.comments);
      setTotalCount(data.totalCount);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [boardId, enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addComment = useCallback(
    async (content: string) => {
      if (!user) throw new Error('User not authenticated');

      setCreatingComment(true);
      try {
        const created = await createCommentRequest({ boardId: `${boardId}`, content });
        setComments((prev) => [created, ...prev]);
        setTotalCount((prev) => prev + 1);
        return created.Id;
      } finally {
        setCreatingComment(false);
      }
    },
    [boardId, user]
  );

  const addReply = useCallback(
    async (parentId: string, content: string) => {
      if (!user) throw new Error('User not authenticated');

      const created = await createCommentRequest({ boardId: `${boardId}`, parentId, content });
      await refetch();
      return created.Id;
    },
    [boardId, user, refetch]
  );

  const likeComment = useCallback(async (commentId: string) => {
    const result = await likeCommentRequest(commentId);
    setComments((prev) =>
      prev.map((comment) =>
        comment.Id === commentId
          ? {
              ...comment,
              likeCount: result.likeCount,
              isLiked: result.isLiked,
              updatedAt: result.updatedAt,
            }
          : comment
      )
    );
  }, []);

  const memoizedTotalCount = useMemo(() => totalCount, [totalCount]);

  return {
    comments,
    totalCount: memoizedTotalCount,
    loading,
    error,
    refetch,
    creatingComment,
    addComment,
    addReply,
    likeComment,
  };
};
