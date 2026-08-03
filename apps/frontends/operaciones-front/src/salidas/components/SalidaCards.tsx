"use client";

import React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RouteIcon from "@mui/icons-material/Route";
import {
  Avatar,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import ViajeBase from "../../viajes/types/ViajeBase";
import {
  DEFAULT_VIAJE_IMAGE,
  formatDuration,
} from "../utils/formatters";

export function StatCard({
  label,
  value,
  color = "primary.main",
}: Readonly<{
  label: string;
  value: string;
  color?: string;
}>) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 950, color, lineHeight: 1.15 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function TripCard({
  viaje,
  selected,
  onSelect,
}: Readonly<{
  viaje: ViajeBase;
  selected: boolean;
  onSelect: () => void;
}>) {
  return (
    <Box
      component="button"
      onClick={onSelect}
      sx={{
        p: 0,
        textAlign: "left",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: selected ? "rgba(31, 97, 141, 0.06)" : "background.paper",
        boxShadow: selected
          ? "0 14px 28px rgba(31, 97, 141, 0.16)"
          : "0 8px 18px rgba(15, 23, 42, 0.06)",
        cursor: "pointer",
        transition: "transform 140ms ease, box-shadow 140ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 16px 30px rgba(15, 23, 42, 0.12)",
        },
      }}
    >
      <Box sx={{ position: "relative", height: 132 }}>
        <Box
          component="img"
          src={viaje.imagenBase64 || viaje.imagenUrl || DEFAULT_VIAJE_IMAGE}
          alt={viaje.nombre}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.58))",
          }}
        />
        <Chip
          label={selected ? "Seleccionado" : viaje.estatus ? "Activo" : "Inactivo"}
          color={selected ? "primary" : viaje.estatus ? "success" : "default"}
          size="small"
          sx={{ position: "absolute", right: 10, top: 10, fontWeight: 850 }}
        />
        <Chip
          icon={<RouteIcon />}
          label={`${viaje.rutas.length} rutas / ${formatDuration(viaje.duracionTotalMin)}`}
          size="small"
          sx={{
            position: "absolute",
            left: 12,
            bottom: 10,
            backgroundColor: "rgba(255,255,255,0.92)",
          }}
        />
      </Box>
      <Box sx={{ p: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 950, lineHeight: 1.15 }}>
          {viaje.nombre}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 40,
          }}
        >
          {viaje.descripcion || "Viaje base listo para programar salidas."}
        </Typography>
      </Box>
    </Box>
  );
}

export function SelectionCard({
  selected,
  title,
  subtitle,
  meta,
  avatar,
  onClick,
}: Readonly<{
  selected: boolean;
  title: string;
  subtitle: string;
  meta?: string;
  avatar: React.ReactNode;
  onClick: () => void;
}>) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        width: "100%",
        p: 1.25,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        display: "grid",
        gridTemplateColumns: "54px minmax(0, 1fr) auto",
        gap: 1.25,
        alignItems: "center",
        textAlign: "left",
        backgroundColor: selected ? "rgba(31, 97, 141, 0.06)" : "background.paper",
        cursor: "pointer",
      }}
    >
      {avatar}
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 950 }} noWrap>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {subtitle}
        </Typography>
        {meta && (
          <Typography
            variant="caption"
            sx={{ display: "block", color: "success.main", fontWeight: 800 }}
          >
            {meta}
          </Typography>
        )}
      </Box>
      {selected ? <CheckCircleIcon color="primary" /> : <Avatar sx={{ width: 8, height: 8 }} />}
    </Box>
  );
}
