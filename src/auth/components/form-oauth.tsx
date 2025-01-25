import React from 'react';

import { Stack, Button } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';

import { CONFIG } from 'src/config-global';

const SocialLoginButtons: React.FC = () => {
  const handleGoogleLogin = () => {
    console.log('Google login');
  };

  const handleKakaoLogin = async () => {
    try {
      window.location.href = 'http://localhost:33330/login';
    } catch (error) {
      console.error('Error during Kakao login:', error);
    }
  };

  return (
    <Stack direction="column" spacing={0.3} width="100%" alignItems="center">
      <Button
        size="large"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleLogin}
        sx={{
          display: 'none',
          backgroundColor: '#4285F4',
          color: '#fff',
          width: '90%',
          height: '30px',
        }}
      >
        Google 로그인
      </Button>
      <Button
        size="large"
        startIcon={
          <img
            src={`${CONFIG.assetsDir}/assets/icons/brands/ic-brand-kakao.svg`}
            alt="Kakao Icon"
          />
        }
        onClick={handleKakaoLogin}
        sx={{
          backgroundColor: '#FEE500',
          color: '#3C1E1E',
          width: '90%',
          height: '30px',
        }}
      >
        Kakao 로그인
      </Button>
    </Stack>
  );
};

export default SocialLoginButtons;
