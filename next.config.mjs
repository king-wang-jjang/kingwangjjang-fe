/**
 * @type {import('next').NextConfig}
 */
const isStaticExport = false;

const nextConfig = {
  trailingSlash: true,
  output: isStaticExport ? 'export' : 'standalone',
  env: {
    NEXT_PUBLIC_BUILD_STATIC_EXPORT: isStaticExport.toString(),
  },
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
  },
};

export default nextConfig;
