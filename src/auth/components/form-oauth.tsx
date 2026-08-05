import React from 'react';

import { Box, Button } from '@mui/material';

import { resolveApiBaseUrl } from 'src/api/api-base-url';

function getKakaoLoginUrl() {
  return `${resolveApiBaseUrl()}/login`;
}

const SocialLoginButtons: React.FC = () => {
  const handleKakaoLogin = async () => {
    try {
      window.location.href = getKakaoLoginUrl();
    } catch (error) {
      console.error('Error during Kakao login:', error);
    }
  };

  return (
    <Button
      className="kakao-login-button"
      size="small"
      variant="text"
      color="inherit"
      onClick={handleKakaoLogin}
      aria-label="카카오 로그인"
      sx={{
        height: 34,
        minWidth: 0,
        py: 0,
        px: 0.5,
        bgcolor: 'transparent',
        color: 'inherit',
        borderRadius: 1,
        '&:hover': {
          bgcolor: 'background.hover',
        },
      }}
    >
      <Box
        component="img"
        className="kakao-login-image"
        src="/kakao_login_small.png"
        alt=""
        aria-hidden="true"
        sx={{
          width: 60,
          height: 30,
          display: 'block',
        }}
      />
    </Button>
  );
};

export default SocialLoginButtons;
