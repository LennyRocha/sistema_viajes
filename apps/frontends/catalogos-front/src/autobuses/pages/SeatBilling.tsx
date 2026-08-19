import { Box, Typography, Divider } from "@mui/material";
import { MotionPaper } from "@nexoroute/commons";
import AsientoBus from "../components/AsientoBus";
import { AsientoEstado } from "../types/AsientoEstado";
import { Layer, Stage } from "react-konva";
import React from "react";

const PasajeroBilling = ({
  pasajero_index,
  asiento_label,
  precio_ruta,
  moneda,
  asientos_restantes,
  setIsMounting,
}) => {
  React.useEffect(() => {
    setIsMounting(false);
  }, [setIsMounting]);
  return (
    <MotionPaper
      sx={{
        display: "flex",
        gap: 2,
        width: "100%",
        flexDirection: { xs: "column", sm: "row" },
        padding: 2,
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flex: 1,
          alignItems: "center",
        }}
      >
        <Stage width={40} height={38}>
          <Layer>
            <AsientoBus
              asiento={{
                id: "test-default",
                x: 2,
                y: 2,
                label: "",
                estado: AsientoEstado.AVAILABLE,
              }}
              showPopup={false}
              verticalRotation
              readonly
              disableHover
            />
          </Layer>
        </Stage>
        <Divider orientation="vertical" />
        <Typography
          variant="h6"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <span>Pasajero 0{pasajero_index} - Adulto</span>

          {asiento_label && (
            <Divider orientation="vertical" flexItem />
          )}

          {asiento_label && (
            <span>Asiento {asiento_label}</span>
          )}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        <Typography variant="caption">
          Precio: <b>${precio_ruta.toFixed(2)}</b> {moneda}
        </Typography>
        <Typography variant="caption">
          Quedan{" "}
          {asientos_restantes > 9 &&
          asientos_restantes !== 0
            ? `${asientos_restantes}`
            : `0${asientos_restantes}`}{" "}
          asientos
        </Typography>
      </Box>
    </MotionPaper>
  );
};

export default PasajeroBilling;
