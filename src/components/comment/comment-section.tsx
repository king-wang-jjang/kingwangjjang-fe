import type { Comment, CommentFormData } from 'src/types/comment';

import { useState } from 'react';

import { Box, Typography } from '@mui/material';

import { CommentForm } from './comment-form';
import { CommentList } from './comment-list';

interface CommentSectionProps {
  postId: string;
  comments?: Comment[];
  commentCount?: number;
  onAddComment?: (data: CommentFormData) => Promise<void>;
  onLikeComment?: (commentId: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  currentUser?: string;
}

export const CommentSection = ({
  postId,
  comments = [],
  commentCount = 0,
  onAddComment,
  onLikeComment,
  onDeleteComment,
  currentUser = '사용자',
}: CommentSectionProps) => {
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  const isReply = (c: Comment) => Boolean(c.parentId);
  const rootComments = localComments.filter((c) => !isReply(c));
  const getReplies = (parentId: string) => localComments.filter((c) => c.parentId === parentId);
  const totalCount = localComments.length;

  const handleAddComment = async (data: CommentFormData, parentId?: string) => {
    if (!onAddComment) {
      // API가 연결되지 않은 경우 로컬에서 처리
      const newComment: Comment = {
        id: `local-${Date.now()}`,
        content: data.content,
        author: currentUser,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        parentId: parentId ?? null,
      };

      setLocalComments((prev) => [newComment, ...prev]);
      return;
    }

    try {
      await onAddComment(data);
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
          comment.id === commentId
            ? {
                ...comment,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                isLiked: !comment.isLiked,
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
          comment.id === commentId ? { ...comment, isLiked: !comment.isLiked } : comment
        )
      );
    } catch (error) {
      console.error('댓글 좋아요 실패:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!onDeleteComment) {
      // API가 연결되지 않은 경우 로컬에서 처리
      setLocalComments((prev) => prev.filter((comment) => comment.id !== commentId));
      return;
    }

    try {
      await onDeleteComment(commentId);
      // API 성공 후 로컬 상태 업데이트
      setLocalComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
    }
  };

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <Box sx={{ pl: 2, pr: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h6" component="div">댓글 {totalCount}개</Typography>
        </Box>

        <CommentForm
          onSubmit={(data) => handleAddComment(data)}
          currentUser={currentUser}
          placeholder="댓글 추가..."
          variant="composer"
        />

        <CommentList
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
