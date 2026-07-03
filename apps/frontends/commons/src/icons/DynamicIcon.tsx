import Icon from "@mui/material/Icon";

type IconSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "xxl"
  | "xxxl";
type IconColor =
  | "primary"
  | "secondary"
  | "accent"
  | "error"
  | "warning"
  | "info"
  | "success"
  | "inherit"
  | "disabled"
  | "actions"
  | "border";

interface SymbolIconProps {
  name: string;
  filled?: boolean;
  size?: IconSize;
  color?: IconColor;
}

const sizes: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
  xxxl: 56,
};

//Lista de íconos: https://fonts.google.com/icons?selected=Material+Symbols+Rounded%3Ahome%3A

export default function DynamicIcon({
  name,
  filled = false,
  size = "md",
  color = "inherit",
}: Readonly<SymbolIconProps>) {
  return (
    <Icon
      baseClassName="material-symbols-rounded"
      color={color}
      sx={{
        fontSize: sizes[size],
        fontVariationSettings: `'FILL' ${
          filled ? 1 : 0
        }, 'wght' 400, 'GRAD' 0, 'opsz' ${sizes[size]}`,
      }}
    >
      {name}
    </Icon>
  );
}

declare module "@mui/material/styles" {
  interface Palette {
    accent: Palette["primary"];
    actions: Palette["primary"];
    border: Palette["primary"];
  }

  interface PaletteOptions {
    accent?: PaletteOptions["primary"];
    actions?: PaletteOptions["primary"];
    border?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Icon" {
  interface IconPropsColorOverrides {
    accent: true;
    actions: true;
    border: true;
  }
}
