import {
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { MotionPaper } from "@nexoroute/commons";
import AsientoBus from "../components/AsientoBus";
import { AsientoEstado } from "../types/AsientoEstado";
import { Layer, Stage } from "react-konva";

const PasajeroBilling = ({}) => {
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
        <Typography variant="h6">
          Pasajero 01 - Adulto Asiento A2
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
          Precio: <b>$680,00</b> MXN
        </Typography>
        <Typography variant="caption">
          Quedan 03 asientos
        </Typography>
      </Box>
    </MotionPaper>
  );
};

export default PasajeroBilling;
