"use client";
import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Typography, useTheme } from "@mui/material";
import Asiento from "../types/Asiento";

type Props = {
  seat: Asiento;
  position: { x: number; y: number };
};

export default function AsientoPopup({
  seat,
  position,
}: Readonly<Props>) {
  const theme = useTheme();
  const stateText = {
    AVAILABLE: "Disponible",
    SELECTED: "Seleccionado",
    RESERVED: "Reservado",
    SOLD: "Vendido",
    OUT_OF_SERVICE: "Fuera de servicio",
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed",
        top: position.y - 12 + "px",
        left: position.x + "px",
        transform: "translate(-50%, -100%)", // centrado y por encima del punto
        padding: "10px",
        borderRadius: "4px",
        boxShadow: `0 0 5px ${theme.palette.divider}`,
        zIndex: 1500,
        backgroundColor: theme.palette.background.paper,
        pointerEvents: "none", // evita que el popup "robe" el hover del canvas
      }}
    >
      <Typography
        variant="body2"
        sx={{ fontWeight: "bold" }}
      >
        Asiento {seat.label}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        {stateText[seat.estado]}
      </Typography>
    </motion.div>,
    document.body,
  );
}
