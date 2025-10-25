import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false, // Disable trailing slash redirect to fix webhook issues
  /* config options here */
};

export default nextConfig;
