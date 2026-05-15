/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    // Allow local static images from /public without any domain restriction
    // Skip image optimization because sharp is not installed
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        // Only proxy paths that start with /api/ — NOT bare static files like /image.png
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://mlm-backend-phi.vercel.app/api' : 'http://localhost:4000/api')}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
