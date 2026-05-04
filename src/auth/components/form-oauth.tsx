import React from 'react';

import { Button } from '@mui/material';

import { CONFIG } from 'src/config-global';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

function isLocalHostname(hostname: string) {
  return LOCAL_HOSTNAMES.has(hostname);
}

function getKakaoLoginUrl() {
  const authServerUrl = isLocalHostname(window.location.hostname)
    ? CONFIG.localServerUrl
    : CONFIG.serverUrl;

  return `${authServerUrl}/login`;
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
      fullWidth
      size="large"
      variant="contained"
      onClick={handleKakaoLogin}
      sx={{
        py: 1,
        px: 1.5,
        bgcolor: '#1e1f23',
        color: '#ffffff',
        borderColor: '#1e1f23',
        borderRadius: 1.5,
        fontWeight: 800,
        '&:hover': {
          bgcolor: '#1e1f23',
          color: '#F7A501',
          opacity: 0.72,
        },
      }}
    >
      카카오 로그인
    </Button>
  );
};

export default SocialLoginButtons;
