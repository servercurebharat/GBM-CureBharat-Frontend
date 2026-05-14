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
    unoptimized: false,
  },
  async rewrites() {
    return [
      {
        // Only proxy paths that start with /api/ — NOT bare static files like /image.png
        source: '/api/:path*',
        // --- TOGGLE HERE ---
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://mlm-backend-phi.vercel.app/api'}/:path*`, // FOR PRODUCTION
        // destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/:path*`, // FOR LOCAL DEVELOPMENT
      },
    ];
  },
};

module.exports = nextConfig;
