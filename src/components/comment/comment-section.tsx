import type { Comment, CommentFormData } from 'src/types/comment';

import { useState, useEffect } from 'react';

import { Box } from '@mui/material';

import { CommentList } from './comment-list';

interface CommentSectionProps {
  postId: string;
  comments?: Comment[];
  commentCount?: number;
  loading?: boolean;
  onAddComment?: (data: CommentFormData) => Promise<void>;
  onAddReply?: (parentId: string, content: string) => Promise<void>;
  onLikeComment?: (commentId: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
}

export const CommentSection = ({
  postId,
  comments = [],
  commentCount = 0,
  loading = false,
  onAddComment,
  onAddReply,
  onLikeComment,
  onDeleteComment,
}: CommentSectionProps) => {
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const isReply = (c: Comment) => Boolean(c.parentId);
  const rootComments = localComments.filter((c) => !isReply(c));
  const getReplies = (parentId: string) => localComments.filter((c) => c.parentId === parentId);

  const handleAddComment = async (data: CommentFormData, parentId?: string) => {
    if (!onAddComment) {
      // API가 연결되지 않은 경우 로컬에서 처리
      const newComment: Comment = {
        content: data.content,
        createdAt: new Date().toISOString(),
        parentId: parentId ?? null,
        Id: '',
        boardId: '',
        userId: '',
        userNickname: '',
        likeCount: 0,
        replyCount: 0,
        isDeleted: false,
        updatedAt: '',
      };

      setLocalComments((prev) => [newComment, ...prev]);
      return;
    }

    try {
      if (parentId && onAddReply) {
        await onAddReply(parentId, data.content);
      } else {
        await onAddComment(data);
      }
      // API 성공 후 로컬 상태 업데이트 (필요 시 서버 응답 반영)
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!onLikeComment) {
      // API가 연결되지 않은 경우 로컬에서 처리
      setLocalComments((prev) =>
        prev.map((comment) =>
          comment.Id === commentId
            ? {
                ...comment,
                likes: comment.likeCount ? comment.likeCount - 1 : comment.likeCount + 1,
                isLiked: !comment.likeCount,
              }
            : comment
        )
      );
      return;
    }

    try {
      await onLikeComment(commentId);
      // API 성공 후 로컬 상태 업데이트
      setLocalComments((prev) =>
        prev.map((comment) =>
          comment.Id === commentId ? { ...comment, isLiked: !comment.likeCount } : comment
        )
      );
    } catch (error) {
      console.error('댓글 좋아요 실패:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!onDeleteComment) {
      // API가 연결되지 않은 경우 로컬에서 처리
      setLocalComments((prev) => prev.filter((comment) => comment.Id !== commentId));
      return;
    }

    try {
      await onDeleteComment(commentId);
      // API 성공 후 로컬 상태 업데이트
      setLocalComments((prev) => prev.filter((comment) => comment.Id !== commentId));
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
    }
  };

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <Box sx={{ pl: 2, pr: 1.5 }}>
        <CommentList
          loading={loading}
          comments={rootComments}
          getReplies={getReplies}
          onLike={handleLikeComment}
          onDelete={handleDeleteComment}
          onReply={(parentId, content) => handleAddComment({ content }, parentId)}
        />
      </Box>
    </Box>
  );
};
