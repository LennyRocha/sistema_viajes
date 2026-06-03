import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    colorSchemes: {
        dark: {
            palette: {
                primary: {
                    main: "#277CB5",
                },
                secondary: {
                    main: "#305092",
                },
                accent: {
                    main: "#14B9DB",
                    contrastText: "#FDFDFD",
                },
                background: {
                    default: "#0a0a0a",
                    paper: "#0c0c0c",
                },
                text: {
                    primary: "#F3F4F6",
                    secondary: "#9CA3AF",
                },
                error: {
                    main: "#EA3829",
                },
                warning: {
                    main: "#F68524",
                    contrastText: "#FFFFFF"
                },
                info: {
                    main: "#3892F3",
                },
                success: {
                    main: "#008F5D",
                }
            },
        },
        light: {
            palette: {
                primary: {
                    main: "#1D608B",
                },
                secondary: {
                    main: "#243B6D",
                },
                accent: {
                    main: "#1092AD",
                    contrastText: "#FFFFFF",
                },
                background: {
                    default: "#FDFDFD",
                    paper: "#FFFFFF",
                },
                text: {
                    primary: "#1A1A1D",
                    secondary: "#4B5563",
                },
                error: {
                    main: "#EA3829",
                },
                warning: {
                    main: "#F68524",
                },
                info: {
                    main: "#3892F3",
                },
                success: {
                    main: "#008F5D",
                }
            },
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontFamily: "Montserrat, sans-serif",
                },
            },
        },
    }
});

export default theme;