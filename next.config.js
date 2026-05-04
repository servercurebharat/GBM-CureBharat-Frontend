/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // --- TOGGLE HERE ---
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://mlm-backend-phi.vercel.app/api'}/:path*`, // FOR PRODUCTION
        // destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/:path*`, // FOR LOCAL DEVELOPMENT
      },
    ];
  },
};

module.exports = nextConfig;
