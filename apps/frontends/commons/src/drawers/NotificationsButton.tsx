"use client";

import React from "react";
import { IconButton, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function NotificationsButton() {
  //Obtener el número de notificaciones no leídas desde el contexto o estado global
  const notificationsCount = 5;
  const handleClick = () =>
    alert("Debería  abrir las notificaciones");
  return notificationsCount > 0 ? (
    <Badge color="error" variant="dot">
      <IconButton
        aria-label="notifications"
        size="small"
        color="inherit"
        onClick={handleClick}
      >
        <NotificationsIcon />
      </IconButton>
    </Badge>
  ) : (
    <IconButton
      aria-label="notifications"
      size="small"
      color="inherit"
      onClick={handleClick}
    >
      <NotificationsIcon />
    </IconButton>
  );
}
