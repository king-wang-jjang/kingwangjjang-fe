/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
          {
            source: '/board',
            destination: '/', // 페이지를 변경하지 않고 URL만 수정합니다
          },
        ];
      },
  };

export default nextConfig;
