import { init } from "@module-federation/enhanced/runtime";

let initialized = false;

export function initFederation() {
  if (initialized) return;
  initialized = true;

  init({
    name: "shell",
    remotes: [
      {
        name: "catalogos",
        entry: process.env.NEXT_PUBLIC_MF_CATALOGOS!,
      },
      {
        name: "operaciones",
        entry: process.env.NEXT_PUBLIC_MF_OPERACIONES!,
      },
      {
        name: "auth",
        entry: process.env.NEXT_PUBLIC_MF_AUTH!,
      },
      {
        name: "dashboard",
        entry: process.env.NEXT_PUBLIC_MF_DASHBOARD!,
      },
    ],
    shared: {
      react: {
        version: "19.2.4",
        scope: "default",
        lib: () => require("react"),
        shareConfig: {
          singleton: true,
          requiredVersion: false,
        },
      },
      "react-dom": {
        version: "19.2.4",
        scope: "default",
        lib: () => require("react-dom"),
        shareConfig: {
          singleton: true,
          requiredVersion: false,
        },
      },
      "react-dom/client": {
        version: "19.2.4",
        scope: "default",
        lib: () => require("react-dom/client"),
        shareConfig: {
          singleton: true,
          requiredVersion: false,
        },
      },
      "@emotion/react": {
        version: "11.14.0",
        scope: "default",
        lib: () => require("@emotion/react"),
        shareConfig: {
          singleton: true,
          requiredVersion: false,
        },
      },
      "@emotion/styled": {
        version: "11.14.1",
        scope: "default",
        lib: () => require("@emotion/styled"),
        shareConfig: {
          singleton: true,
          requiredVersion: false,
        },
      },
      "@mui/material": {
        version: "9.1.1",
        scope: "default",
        lib: () => require("@mui/material"),
        shareConfig: {
          singleton: true,
          requiredVersion: false,
        },
      },
      motion: {
        version: "12.40.0",
        scope: "default",
        lib: () => require("motion"),
        shareConfig: {
          singleton: true,
          requiredVersion: false,
        },
      },
    },
  });
}
