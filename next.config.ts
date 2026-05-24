import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Optimize images from external sources (favicons, etc.)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Make sure experimental features are off for stability
  experimental: {},
};

export default nextConfig;
