import { NextConfig } from "next";
const {
  NextFederationPlugin,
} = require("@module-federation/nextjs-mf");
const shared = require("./shared-mf-config");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@nexoroute/commons"],
  webpack(config, { isServer }) {
    if (!isServer) {
      config.plugins.push(
        new NextFederationPlugin({
          name: "shell",

          filename: "static/chunks/remoteEntry.js",

          exposes: {
            "./sidebarProvider":
              "./src/providers/SidebarProvider",
          },

          remotes: {
            operaciones: `operaciones@${process.env.NEXT_PUBLIC_MF_OPERACIONES}`,
            catalogos: `catalogos@${process.env.NEXT_PUBLIC_MF_CATALOGOS}`,
            auth: `auth@${process.env.NEXT_PUBLIC_MF_AUTH}`,
            dashboard: `dashboard@${process.env.NEXT_PUBLIC_MF_DASHBOARD}`,
          },

          shared,
        }),
      );
    }

    return config;
  },
};

export default nextConfig;
