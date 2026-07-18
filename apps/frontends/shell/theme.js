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
                    default: "#05070A",
                    paper: "#05070A",
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
                },
                actions: {
                    main: "#4A6D80",
                },
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
                    default: "#FFFFFF",
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
                    contrastText: "#FFFFFF"
                },
                info: {
                    main: "#3892F3",
                },
                success: {
                    main: "#008F5D",
                },
                actions: {
                    main: "#D0EEFB"
                },
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
        MuiTab: {
            styleOverrides: {
                root: {
                    fontFamily: "Montserrat, sans-serif",
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    fontFamily: "Montserrat, sans-serif",
                },
            },
        },
        MuiFormLabel: {
            styleOverrides: (theme) => ({
                asterisk: {
                    color: theme.palette.error.main,
                },
            }),
        },
        MuiCssBaseline: {
            styleOverrides: (theme) => ({
                "*": {
                    scrollbarWidth: "thin",
                    scrollbarColor: `${theme.palette.background.paper} transparent`,
                    fontFamily: "Inter, sans-serif",
                },

                "*::-webkit-scrollbar": {
                    width: "8px",
                    height: "8px",
                },

                "*::-webkit-scrollbar-thumb": {
                    backgroundColor: theme.palette.divider,
                    borderRadius: "8px",
                },

                "*::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: theme.palette.primary.dark,
                },
            }),
        },
    }
});

export default theme;