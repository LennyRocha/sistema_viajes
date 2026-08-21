const { NextFederationPlugin } = require("@module-federation/nextjs-mf");
const shared = require("./shared-mf-config");

module.exports = {
    webpack(config) {
        config.plugins.push(
            new NextFederationPlugin({
                name: "operaciones",

                filename: "static/chunks/remoteEntry.js",

                exposes: {
                    "./ViajesModule": "./src/viajes/pages",
                    "./SalidasModule": "./src/salidas/pages",
                    "./CalendarioModule": "./src/calendario/pages",
                },

                shared,
            })
        );

        return config;
    },
};
