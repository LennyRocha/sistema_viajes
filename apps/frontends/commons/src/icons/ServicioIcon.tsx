import Icon from "@mui/material/Icon";
import { normalizeIconName } from "../utils/normalizeIconName";

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

interface ServiceIconProps {
  name: string;
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

function getVariant(name: string) {
  if (name.endsWith("-sharp")) {
    return variantClass.sharp;
  }
  return variantClass.rounded;
}

const variantClass = {
  rounded: "material-symbols-rounded",
  sharp: "material-symbols-sharp",
};

export default function ServiceIcon({
  name,
  size = "md",
  color = "inherit",
}: Readonly<ServiceIconProps>) {
  const className = getVariant(name);

  return (
    <Icon
      baseClassName={className}
      color={color}
      sx={{
        fontSize: sizes[size],
        fontVariationSettings: `'FILL' ${
          name.includes("-outline") ? 0 : 1
        }, 'wght' 400, 'GRAD' 0, 'opsz' ${sizes[size]}`,
      }}
    >
      {normalizeIconName(name)}
    </Icon>
  );
}
