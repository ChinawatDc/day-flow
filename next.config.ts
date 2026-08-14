import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@neondatabase/serverless", "ably"],
  webpack: (config) => {
    const prev = config.module.noParse;
    const extra = /node_modules\/ably/;
    config.module.noParse = prev ? (Array.isArray(prev) ? [...prev, extra] : [prev, extra]) : extra;
    return config;
  },
};

export default nextConfig;
