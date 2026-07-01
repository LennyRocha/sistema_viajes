import { MotionPaper } from "@nexoroute/commons";
import { Box, Typography } from "@mui/material";
import React from "react";
import Vehiculo3D from "../../tipos_autobus/components/Vehiculo3D";
import Modelo3DName from "../../tipos_autobus/types/Modelo3DName";

type Props = {
  model: Modelo3DName;
};

export default function VehiculoPreview({
  model = "hyundai",
}: Readonly<Props>) {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flex: 1,
      }}
    >
      <MotionPaper
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "12px",
          gap: "16px",
        }}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Previsualización
        </Typography>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Vehiculo3D tipo={model} width={300} canRotate />
        </Box>

        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            fontStyle: "italic",
          }}
        >
          <b>NOTA:</b> No representa el modelo real del
          vehículo, pero si representa uno de los tipos de
          autobuses disponibles
        </Typography>
      </MotionPaper>
    </Box>
  );
}
