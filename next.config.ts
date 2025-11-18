import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false, // Disable trailing slash redirect to fix webhook issues
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'claude.ai',
      },
      {
        protocol: 'https',
        hostname: 'cursor.sh',
      },
      {
        protocol: 'https',
        hostname: 'lovable.dev',
      },
    ],
  },
};

export default nextConfig;
