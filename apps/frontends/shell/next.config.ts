import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@nexoroute/commons"],
  allowedDevOrigins: ["192.168.1.69", "*"],
};

export default nextConfig;
