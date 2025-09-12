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
      sx={{ display: 'flex', gap: 1.25, py: 1.25, alignItems: 'flex-start' }}
    >
      <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.75rem', mt: 0.5 }}>
        {currentUser.charAt(0).toUpperCase()}
      </Avatar>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TextField
            multiline
            minRows={1}
            maxRows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsActive(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            variant="standard"
            fullWidth
            sx={{
              '& .MuiInput-underline:before': {
                borderBottomColor: 'divider',
              },
              '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                borderBottomColor: 'primary.main',
              },
              '& .MuiInput-underline:after': {
                borderBottomColor: 'primary.main',
              },
              '& .MuiInputBase-input': {
                py: 1,
                fontSize: '0.875rem',
                lineHeight: 1.2,
                maxHeight: 'calc(4 * 1.2em + 16px)', // 4줄의 최대 높이
                overflow: 'auto',
              },
              '& .MuiInputBase-root': {
                alignItems: 'flex-start',
              },
            }}
            autoFocus={autoFocus}
          />

        {(isActive || content.trim()) && (
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
                sx={{ textTransform: 'none', minWidth: 'auto' }}
              >
                취소
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={!content.trim() || isSubmitting}
              sx={{ textTransform: 'none', minWidth: 'auto' }}
            >
              {actionPrimaryLabel}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};
