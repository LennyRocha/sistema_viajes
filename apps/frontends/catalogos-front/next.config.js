const { NextFederationPlugin } = require("@module-federation/nextjs-mf");
const shared = require("./shared-mf-config");

module.exports = {
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
    webpack(config, { isServer }) {
        if (!isServer) {
            config.plugins.push(
                new NextFederationPlugin({
                    name: "catalogos",
                    filename: "static/chunks/remoteEntry.js",
                    exposes: {
                        "./ServiciosModule": "./src/servicios/pages",
                        "./exports": "./src/federation/index",
                    },
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