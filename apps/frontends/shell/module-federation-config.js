const { NextFederationPlugin } = require("@module-federation/nextjs-mf");
const shared = require("./shared-mf-config");

module.exports = {
    webpack(config, options) {
        config.plugins.push(
            new NextFederationPlugin({
                name: "shell",

                filename: "static/chunks/remoteEntry.js",

                exposes: {
                    "./sidebarProvider": "./src/providers/SidebarProvider",
                },

                remotes: {
                    operaciones:
                        "operaciones@http://localhost:3004/_next/static/chunks/remoteEntry.js",
                    catalogos:
                        "catalogos@http://localhost:3002/_next/static/chunks/remoteEntry.js",
                    auth:
                        "auth@http://localhost:3001/_next/static/chunks/remoteEntry.js",
                    dashboard:
                        "dashboard@http://localhost:3003/_next/static/chunks/remoteEntry.js",
                },

                shared,
            })
        );

        return config;
    },
};
