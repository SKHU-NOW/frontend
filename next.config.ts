import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "myawsbucket-test-123412.s3.ap-northeast-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
