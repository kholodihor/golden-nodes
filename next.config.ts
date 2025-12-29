import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators:false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/workflows',
        permanent: false
      }
    ]
  }
  /* config options here */
};

export default nextConfig;
