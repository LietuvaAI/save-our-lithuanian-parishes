import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 2026-07-16 IA restructure: The Record absorbed the old Data page;
      // the Network page became About.
      { source: "/data", destination: "/record", permanent: true },
      { source: "/network", destination: "/about", permanent: true },
      { source: "/now", destination: "/under-threat", permanent: true },
    ];
  },
};

export default nextConfig;
