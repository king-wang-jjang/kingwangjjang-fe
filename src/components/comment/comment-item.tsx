import type { Comment } from 'src/types/comment';

import { useState } from 'react';

import { Box, Avatar, Typography, IconButton, Button, Collapse } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

import { CommentForm } from './comment-form';

interface CommentItemProps {
  comment: Comment;
  replies?: Comment[];
  onLike?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onReply?: (parentId: string, content: string) => void;
}

export const CommentItem = ({ comment, replies = [], onLike, onDelete, onReply }: CommentItemProps) => {
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likes);
  const [showReplies, setShowReplies] = useState(true);
  const [showReplyBox, setShowReplyBox] = useState(false);

  const handleLike = () => {
    if (onLike) {
      onLike(comment.id);
    }
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const formatTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
  };

  return (
    <Box sx={{ display: 'flex', gap: 1.5, py: 1 }} onClick={(e) => e.stopPropagation()}>
      <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
        {comment.author.charAt(0).toUpperCase()}
      </Avatar>

      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {comment.author}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatTimeAgo(comment.createdAt)}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 0.75, lineHeight: 1.6 }}>
          {comment.content}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={handleLike} sx={{ color: isLiked ? 'error.main' : 'text.secondary' }}>
            {isLiked ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
          </IconButton>
          <Typography variant="caption" color="text.secondary">
            {likesCount}
          </Typography>
          <Button size="small" onClick={() => setShowReplyBox((v) => !v)} sx={{ textTransform: 'none' }}>
            답글
          </Button>
          {!!replies.length && (
            <Button size="small" onClick={() => setShowReplies((v) => !v)} sx={{ textTransform: 'none' }}>
              {showReplies ? `답글 숨기기 (${replies.length})` : `답글 보기 (${replies.length})`}
            </Button>
          )}
        </Box>

        {/* 대댓글 입력 */}
        <Collapse in={showReplyBox} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 5 }}>
            {onReply && (
              <Box sx={{ mt: 1 }}>
                <CommentForm
                  onSubmit={({ content }) => onReply(comment.id, content)}
                  onCancel={() => setShowReplyBox(false)}
                  placeholder="답글 추가..."
                  variant="reply"
                  autoFocus
                />
              </Box>
            )}
          </Box>
        </Collapse>

        {/* 대댓글 목록 */}
        <Collapse in={showReplies} timeout="auto" unmountOnExit>
          {!!replies.length && (
            <Box sx={{ mt: 1, pl: 5, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {replies.map((child) => (
                <CommentItem key={child.id} comment={child} replies={[]} onLike={onLike} onDelete={onDelete} onReply={onReply} />
              ))}
            </Box>
          )}
        </Collapse>
      </Box>
    </Box>
  );
};
