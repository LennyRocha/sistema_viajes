const { NextFederationPlugin } = require("@module-federation/nextjs-mf");
const shared = require("./shared-mf-config");

module.exports = {
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
    assetPrefix: 'http://localhost:3002',
    webpack(config, { isServer }) {
        if (!isServer) {
            config.plugins.push(
                new NextFederationPlugin({
                    name: "catalogos",
                    filename: "static/chunks/remoteEntry.js",
                    exposes: {
                        "./AutobusesModule": "./src/autobuses/pages",
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