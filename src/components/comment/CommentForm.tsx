import type { CommentFormData } from 'src/types/comment';

import { useState } from 'react';

import { Send } from '@mui/icons-material';
import { Box, Button, Avatar, TextField } from '@mui/material';

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => void;
  placeholder?: string;
  buttonText?: string;
  currentUser?: string;
}

export const CommentForm = ({
  onSubmit,
  placeholder = '댓글을 입력하세요...',
  buttonText = '댓글 작성',
  currentUser = '사용자',
}: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ content: content.trim() });
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, py: 2 }}>
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: 'primary.main',
          fontSize: '1rem',
        }}
      >
        {currentUser.charAt(0).toUpperCase()}
      </Avatar>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TextField
          multiline
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={!content.trim() || isSubmitting}
            startIcon={<Send />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 2,
            }}
          >
            {buttonText}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
