// next.config.mjs
import nextPwa from 'next-pwa';

const withPWA = nextPwa({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/**
 * @type {import('next').NextConfig}
 */
const isStaticExport = false; // 불리언 값으로 설정

const nextConfig = {
  trailingSlash: true,
  swcMinify: true,
  experimental: {
    appDir: true, // Next.js App Router 사용 시 필요
  },
  env: {
    NEXT_PUBLIC_BUILD_STATIC_EXPORT: isStaticExport,
  },
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  ...(isStaticExport === 'true' && {
    output: 'export',
  }),
};

export default withPWA(nextConfig);
