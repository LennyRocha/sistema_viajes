const { NextFederationPlugin } = require("@module-federation/nextjs-mf");
const shared = require("./shared-mf-config");

module.exports = {
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
    assetPrefix: process.env.NEXT_ASSET_PREFIX || "http://localhost:3001",
    webpack(config, { isServer }) {
        if (!isServer) {
            config.plugins.push(
                new NextFederationPlugin({
                    name: "auth",
                    filename: "static/chunks/remoteEntry.js",
                    exposes: {
                        "./UsuariosModule": "./src/usuarios/pages",
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