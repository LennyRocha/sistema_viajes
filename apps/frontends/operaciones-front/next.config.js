const { NextFederationPlugin } = require("@module-federation/nextjs-mf");
const shared = require("./shared-mf-config");

module.exports = {
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
    assetPrefix: 'http://localhost:3004',
    webpack(config, { isServer }) {
        if (!isServer) {
            config.plugins.push(
                new NextFederationPlugin({
                    name: "operaciones",
                    filename: "static/chunks/remoteEntry.js",
                    exposes: {
                        "./ViajesModule": "./src/viajes/pages",
                        "./SalidasModule": "./src/salidas/pages",
                        "./MetodosPagoModule": "./src/metodos_pago/pages",
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
