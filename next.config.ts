import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false, // Disable trailing slash redirect to fix webhook issues
  experimental: {
    turbo: false, // Disable Turbopack for builds to avoid parsing errors
  },
  /* config options here */
};

export default nextConfig;
