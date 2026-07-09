import { Box, Typography } from "@mui/material";
import React from "react";
import AsientoBus from "./AsientoBus";
import { Layer, Stage } from "react-konva";
import { AsientoEstado } from "../types/AsientoEstado";

export default function AsientoSimbología() {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="subtitle2">
        Simbología
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1em",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
          }}
        >
          <Stage width={40} height={38}>
            <Layer>
              <AsientoBus
                asiento={{
                  id: "test-default",
                  x: 2,
                  y: 2,
                  label: "T1",
                  estado: AsientoEstado.AVAILABLE,
                }}
                showPopup={false}
                verticalRotation
                readonly
                disableHover
              />
            </Layer>
          </Stage>
          <Typography variant="body2" sx={{ ml: 1 }}>
            Disponible
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
          }}
        >
          <Stage width={40} height={38}>
            <Layer>
              <AsientoBus
                asiento={{
                  id: "test-default",
                  x: 2,
                  y: 2,
                  label: "T2",
                  estado: AsientoEstado.SELECTED,
                }}
                showPopup={false}
                verticalRotation
                disableHover
                readonly
              />
            </Layer>
          </Stage>
          <Typography variant="body2" sx={{ ml: 1 }}>
            Seleccionado
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
          }}
        >
          <Stage width={40} height={38}>
            <Layer>
              <AsientoBus
                asiento={{
                  id: "test-default",
                  x: 2,
                  y: 2,
                  label: "T3",
                  estado: AsientoEstado.RESERVED,
                }}
                showPopup={false}
                verticalRotation
                disableHover
                readonly
              />
            </Layer>
          </Stage>
          <Typography variant="body2" sx={{ ml: 1 }}>
            Reservado
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
          }}
        >
          <Stage width={40} height={38}>
            <Layer>
              <AsientoBus
                asiento={{
                  id: "test-default",
                  x: 2,
                  y: 2,
                  label: "T4",
                  estado: AsientoEstado.SOLD,
                }}
                showPopup={false}
                verticalRotation
                disableHover
                readonly
              />
            </Layer>
          </Stage>
          <Typography variant="body2" sx={{ ml: 1 }}>
            Vendido
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
          }}
        >
          <Stage width={40} height={38}>
            <Layer>
              <AsientoBus
                asiento={{
                  id: "test-default",
                  x: 2,
                  y: 2,
                  label: "T5",
                  estado: AsientoEstado.OUT_OF_SERVICE,
                }}
                showPopup={false}
                verticalRotation
                readonly
              />
            </Layer>
          </Stage>
          <Typography variant="body2" sx={{ ml: 1 }}>
            Fuera de servicio
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
