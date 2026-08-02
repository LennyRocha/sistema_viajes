const { NextFederationPlugin } = require("@module-federation/nextjs-mf");
const shared = require("./shared-mf-config");
const path = require("path");

module.exports = {
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
    assetPrefix: 'http://localhost:3002',
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*",
            },
        ],
    },
    webpack(config, { isServer }) {
        if (!isServer) {
            config.resolve.alias = {
                ...config.resolve.alias,
                three: require.resolve("three"),
                "@react-three/fiber": require.resolve("@react-three/fiber"),
                "@react-three/drei": require.resolve("@react-three/drei"),
                'react': path.resolve(__dirname, 'node_modules/react'),
                'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
                '@mui/material': path.resolve(__dirname, 'node_modules/@mui/material'),
            };

            config.plugins.push(
                new NextFederationPlugin({
                    name: "catalogos",
                    filename: "static/chunks/remoteEntry.js",
                    exposes: {
                        "./AutobusesModule": "./src/autobuses/pages",
                        "./DisponibilidadModule": "./src/disponibilidad-servicios/pages",
                        "./ServiciosModule": "./src/servicios/pages",
                        "./InstitucionesModule": "./src/instituciones/pages",
                        "./exports": "./src/federation/index",
                        "./ConductoresModule": "./src/conductores/pages",
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

        return config;  // ← aquí adentro
    },
};
