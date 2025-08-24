import { useState } from 'react';
import { Box, Collapse, IconButton, Typography, Chip } from '@mui/material';
import { ChatBubbleOutline, ChatBubble } from '@mui/icons-material';
import { Comment, CommentFormData } from 'src/types/comment';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [localCommentCount, setLocalCommentCount] = useState(commentCount);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddComment = async (data: CommentFormData) => {
    if (!onAddComment) {
      // API가 연결되지 않은 경우 로컬에서 처리
      const newComment: Comment = {
        id: `local-${Date.now()}`,
        content: data.content,
        author: currentUser,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      };

      setLocalComments((prev) => [newComment, ...prev]);
      setLocalCommentCount((prev) => prev + 1);
      return;
    }

    try {
      await onAddComment(data);
      // API 성공 후 로컬 상태 업데이트
      setLocalCommentCount((prev) => prev + 1);
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
      setLocalCommentCount((prev) => prev - 1);
      return;
    }

    try {
      await onDeleteComment(commentId);
      // API 성공 후 로컬 상태 업데이트
      setLocalComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setLocalCommentCount((prev) => prev - 1);
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
    }
  };

  return (
    <Box>
      {/* 댓글 토글 버튼 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          py: 1,
          px: 1,
          borderRadius: 1,
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={handleToggle}
      >
        <IconButton size="small" sx={{ color: 'text.secondary' }}>
          {isExpanded ? <ChatBubble /> : <ChatBubbleOutline />}
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          댓글
        </Typography>
        {localCommentCount > 0 && (
          <Chip label={localCommentCount} size="small" sx={{ height: 20, fontSize: '0.75rem' }} />
        )}
      </Box>

      {/* 댓글 섹션 */}
      <Collapse in={isExpanded} timeout="auto">
        <Box sx={{ pl: 4, pr: 1 }}>
          {/* 댓글 작성 폼 */}
          <CommentForm
            onSubmit={handleAddComment}
            currentUser={currentUser}
            placeholder="이 게시글에 대한 의견을 남겨보세요..."
            buttonText="댓글 작성"
          />

          {/* 댓글 목록 */}
          <CommentList
            comments={localComments}
            onLike={handleLikeComment}
            onDelete={handleDeleteComment}
          />
        </Box>
      </Collapse>
    </Box>
  );
};
