const { NextFederationPlugin } = require("@module-federation/nextjs-mf");
const shared = require("./shared-mf-config");

module.exports = {
    webpack(config) {
        config.plugins.push(
            new NextFederationPlugin({
                name: "dashboard-reportes",

                filename: "static/chunks/remoteEntry.js",

                exposes: {
                    "./App": "./src/app",
                    "./routes": "./src/routes",
                },

                shared,
            })
        );

        return config;
    },
};