import "@mui/material/styles";
import "@mui/material/Button";

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    accent: true;
  }
}
declare module "@mui/material/styles" {
  interface Palette {
    accent: Palette["primary"];
    actions: Palette["primary"];
  }

  interface PaletteOptions {
    accent?: PaletteOptions["primary"];
    actions?: PaletteOptions["primary"];
  }
}
