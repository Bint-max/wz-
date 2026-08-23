import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // 支持从本地 public 目录与常见外链加载图片
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  // 提升生产构建在 Vercel 上的性能
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
