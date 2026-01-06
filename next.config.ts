import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   // Docker 프로덕션 빌드용
  output: 'standalone',
};

export default nextConfig;
