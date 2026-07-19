import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@nexoroute/commons"],
  crossOrigin: "anonymous",
};

export default nextConfig;
