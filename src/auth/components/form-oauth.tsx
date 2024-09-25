import React from 'react';

import { Stack, Button } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';

import { CONFIG } from 'src/config-global';

const SocialLoginButtons: React.FC = () => {
  const handleGoogleLogin = () => {
    console.log('Google login');
  };

  const handleKakaoLogin = () => {
    console.log('Kakao login');
  };

  return (
    <Stack direction="column" spacing={0.8}>
      <Button
        variant="contained"
        size="large"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleLogin}
        sx={{ backgroundColor: '#4285F4', color: '#fff', width: '200px' }}
      >
        Google 로그인
      </Button>
      <Button
        variant="contained"
        size="large"
        startIcon={
          <img
            src={`${CONFIG.assetsDir}/assets/icons/brands/ic-brand-kakao.svg`}
            alt="Kakao Icon"
          />
        }
        onClick={handleKakaoLogin}
        sx={{ backgroundColor: '#FEE500', color: '#3C1E1E', width: '200px' }}
      >
        Kakao 로그인
      </Button>
    </Stack>
  );
};

export default SocialLoginButtons;
