const { NextFederationPlugin } = require("@module-federation/nextjs-mf");
const shared = require("./shared-mf-config");

module.exports = {
    webpack(config) {
        config.plugins.push(
            new NextFederationPlugin({
                name: "catalogos",

                filename: "static/chunks/remoteEntry.js",

                exposes: {
                    "./AutobusesModule": "./src/autobuses/pages",
                    "./TipoAutobusModule": "./src/tipo_autobus/pages",
                    "./ServiciosModule": "./src/servicios/pages",
                    "./InstitucionesModule": "./src/instituciones/pages",
                    "./exports": "./src/federation/index",
                },

                shared,
            })
        );

        return config;
    },
};
