const { NextFederationPlugin } = require("@module-federation/nextjs-mf");
const shared = require("./shared-mf-config");

module.exports = {
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
    webpack(config, { isServer }) {
        if (!isServer) {
            config.plugins.push(
                new NextFederationPlugin({
                    name: "dashboard-reportes",
                    filename: "static/chunks/remoteEntry.js",
                    exposes: {},
                    shared,
                    extraOptions: {
                        enableImageLoaderFix: true,
                        enableUrlLoaderFix: true,
                        skipSharingNextInternals: true,
                    },
                })
            );
        }
        return config;
    },
};