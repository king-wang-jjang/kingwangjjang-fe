import type { CommentFormData } from 'src/types/comment';

import { useState } from 'react';

import { Box, Button, Avatar, TextField } from '@mui/material';

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => void;
  onCancel?: () => void;
  placeholder?: string;
  currentUser?: string;
  variant?: 'composer' | 'reply';
  autoFocus?: boolean;
}

export const CommentForm = ({
  onSubmit,
  onCancel,
  placeholder = '댓글 추가...',
  currentUser = '사용자',
  variant = 'composer',
  autoFocus = false,
}: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActive, setIsActive] = useState(autoFocus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const actionPrimaryLabel = variant === 'reply' ? '답글' : '댓글';

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      onClick={(e) => e.stopPropagation()}
      sx={{ display: 'flex', gap: 1.5, py: 1.5 }}
    >
      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
        {currentUser.charAt(0).toUpperCase()}
      </Avatar>

      <Box sx={{ flex: 1 }}>
        <TextField
          multiline
          minRows={isActive ? 2 : 1}
          maxRows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsActive(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          variant="standard"
          fullWidth
          sx={{
            '& .MuiInputBase-root': {
              px: 1,
              pb: 0.5,
            },
          }}
          autoFocus={autoFocus}
        />

        {(isActive || content.trim()) && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
            {onCancel && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setContent('');
                  setIsActive(false);
                  onCancel?.();
                }}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                취소
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={!content.trim() || isSubmitting}
              sx={{ textTransform: 'none' }}
            >
              {actionPrimaryLabel}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};
