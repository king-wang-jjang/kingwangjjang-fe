/**
 * @type {import('next').NextConfig}
 */
const isStaticExport = false;

const nextConfig = {
  trailingSlash: true,
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
  ...(isStaticExport && {
    output: 'export',
  }),
};

export default nextConfig;
