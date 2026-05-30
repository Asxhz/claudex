import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/__utrace/:path*",
        destination: "/utrace-adapters/:path*",
      },
    ];
  },
};

export default nextConfig;
