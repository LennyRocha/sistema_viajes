import React from "react";
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
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "absolute",
        top: position.y + 10 + "px",
        left: position.x + 10 + "px",
        padding: "10px",
        borderRadius: "4px",
        boxShadow: `0 0 5px ${theme.palette.divider}`,
        zIndex: 10,
        backgroundColor: theme.palette.background.paper,
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
    </motion.div>
  );
}
