import {
  Box,
  Typography,
  Button,
  SxProps,
  Theme,
} from "@mui/material";
import {
  emptyStateImages,
  type EmptyStateImageKey,
} from "../types/EmptyStateImages";

interface EmptyStateProps {
  variant: EmptyStateImageKey;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  fullHeight?: boolean;
  imageAlt?: string;
  imageSize?: {
    width: number;
    height: number;
  };
  sx?: SxProps<Theme>;
  isLoading?: boolean;
}
export default function EmptyState({
  variant,
  title,
  description,
  action,
  fullHeight = false,
  imageAlt = "",
  sx = {},
  imageSize,
  isLoading = false,
}: Readonly<EmptyStateProps>) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 350,
        gap: 2,
        ...(fullHeight && {
          minHeight: "100%",
          flex: 1,
        }),
        ...sx,
      }}
    >
      <img
        src={emptyStateImages[variant]}
        width={imageSize?.width ?? 180}
        height={imageSize?.height ?? 180}
        alt={imageAlt || ""}
        loading="lazy"
      />

      <Typography
        variant="h5"
        sx={{ fontWeight: 600, textAlign: "center" }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          {description}
        </Typography>
      )}

      {action && (
        <Button
          variant="contained"
          onClick={action.onClick}
          loading={isLoading}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}
