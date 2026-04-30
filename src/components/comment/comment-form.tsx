import type { CommentFormData } from 'src/types/comment';

import { useState } from 'react';

import { Box, Button, Avatar, TextField } from '@mui/material';

import { useAuthStore } from 'src/store/auth-store';

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => void;
  onCancel?: () => void;
  placeholder?: string;
  variant?: 'composer' | 'reply';
  autoFocus?: boolean;
}

export const CommentForm = ({
  onSubmit,
  onCancel,
  placeholder = '댓글 추가...',
  variant = 'composer',
  autoFocus = false,
}: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActive, setIsActive] = useState(autoFocus);
  const { isAuthenticated, user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ content: content.trim() });
      setContent('');
      setIsActive(false);
      if (onCancel && variant === 'reply') onCancel();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // 이미 제출 중이거나 내용이 비어있으면 무시
      if (isSubmitting || !content.trim()) return;
      handleSubmit(e as any);
    }
  };

  const actionPrimaryLabel = variant === 'reply' ? '답글' : '댓글';

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      onClick={(e) => e.stopPropagation()}
      sx={{ display: 'flex', gap: 1.25, py: 1.25, alignItems: 'flex-start' }}
    >
      {isAuthenticated && (
        <Avatar sx={{ width: 28, height: 28, bgcolor: '#1e1f23', fontSize: '0.75rem', mt: 0.5 }}>
          {user?.nickname.charAt(0).toUpperCase()}
        </Avatar>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TextField
          multiline
          minRows={1}
          maxRows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsActive(true)}
          onKeyDown={handleKeyDown}
          placeholder={isAuthenticated ? placeholder : '로그인 후 댓글을 작성할 수 있습니다.'}
          variant="standard"
          fullWidth
          disabled={!isAuthenticated}
          sx={{
            px: 1,
            py: 0.5,
            border: '1px solid #bfc1b7',
            borderRadius: '4px',
            bgcolor: '#eeefe9',
            '&:focus-within': {
              borderColor: '#3b82f6',
              boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.16)',
            },
            '& .MuiInput-root:before, & .MuiInput-root:after': {
              display: 'none',
            },
            '& .MuiInputBase-input': {
              maxHeight: 'calc(4 * 1.2em + 16px)', // 4줄의 최대 높이
              overflow: 'auto',
              color: '#374151',
              fontSize: 14,
            },
          }}
          autoFocus={autoFocus}
        />

        {isAuthenticated && (isActive || content.trim()) && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 0.5 }}>
            {onCancel && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setContent('');
                  setIsActive(false);
                  onCancel?.();
                }}
                size="small"
                sx={{
                  textTransform: 'none',
                  minWidth: 'auto',
                  color: '#4d4f46',
                  '&:hover': { color: '#F54E00', bgcolor: 'transparent' },
                }}
              >
                취소
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={!isAuthenticated || !content.trim() || isSubmitting}
              sx={{
                minWidth: 'auto',
                borderRadius: '4px',
                bgcolor: '#1e1f23',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#1e1f23',
                  color: '#F7A501',
                  opacity: 0.8,
                },
              }}
            >
              {actionPrimaryLabel}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};
