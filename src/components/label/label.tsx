'use client';

import { forwardRef } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { StyledLabel } from './styles';
import { labelClasses } from './classes';

import type { LabelProps } from './types';

// ----------------------------------------------------------------------

export const Label = forwardRef<HTMLSpanElement, LabelProps>(
  (
    { children, color = 'default', variant = 'soft', startIcon, endIcon, sx, className, ...other },
    ref
  ) => {
    const theme = useTheme();

    const iconStyles = {
      width: 16,
      height: 16,
      '& svg, img': {
        width: 1,
        height: 1,
        objectFit: 'cover',
      },
    };

    return (
      <StyledLabel
      ref={ref}
      component="span"
      className={labelClasses.root.concat(className ? ` ${className}` : '')}
      ownerState={{ color, variant }}
      sx={{
        fontSize: '0.50rem', // 글자 크기 줄이기
        padding: '1px 3px', // 내부 패딩 줄이기
        height: '15px', // 높이 줄이기
        lineHeight: 1, // 줄 간격 줄이기
        ...(startIcon && { pl: 0.5 }), // 왼쪽 패딩 줄이기
        ...(endIcon && { pr: 0.5 }), // 오른쪽 패딩 줄이기
        ...sx,
      }}
      theme={theme}
      {...other}
    >
      {startIcon && (
        <Box component="span" className={labelClasses.icon} sx={{ mr: 0.5, ...iconStyles }}>
          {startIcon}
        </Box>
      )}

      {typeof children === 'string' ? sentenceCase(children) : children}

      {endIcon && (
        <Box component="span" className={labelClasses.icon} sx={{ ml: 0.5, ...iconStyles }}>
          {endIcon}
        </Box>
      )}
    </StyledLabel>
    );
  }
);

// ----------------------------------------------------------------------

function sentenceCase(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
