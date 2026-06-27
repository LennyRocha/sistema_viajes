"use client";

import { IconButton, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

interface NotificationsButtonProps {
  onClick: () => void; //Al presionar el botón de notificaciones, se ejecutará esta función
  notificationsCount?: number; // Número de notificaciones no leídas
}

export default function NotificationsButton({
  onClick,
  notificationsCount = 0,
}: NotificationsButtonProps) {
  return notificationsCount > 0 ? (
    <Badge color="error" variant="dot">
      <IconButton
        aria-label="notifications"
        size="small"
        color="inherit"
        onClick={onClick}
      >
        <NotificationsIcon />
      </IconButton>
    </Badge>
  ) : (
    <IconButton
      aria-label="notifications"
      size="small"
      color="inherit"
      onClick={onClick}
    >
      <NotificationsIcon />
    </IconButton>
  );
}
