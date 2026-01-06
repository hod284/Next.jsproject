import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   // Docker 프로덕션 빌드용
  output: 'standalone',

  // 이미지 최적화 비활성화
  images: {
    unoptimized: true,
  },
  
  
  
  // ⭐ React Strict Mode (개발 중 경고 활성화)
  reactStrictMode: true,
};

export default nextConfig;
