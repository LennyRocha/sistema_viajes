import {
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { MotionPaper } from "@nexoroute/commons";
import AsientoBus from "../components/AsientoBus";
import { AsientoEstado } from "../types/AsientoEstado";
import { Layer, Stage } from "react-konva";

const PasajeroCard = ({}) => {
  return (
    <MotionPaper
      sx={{
        display: "flex",
        gap: 2,
        width: "100%",
        flexDirection: "column",
        padding: 2,
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
        }}
      >
        <Typography variant="h5">Pasajero 01</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              width: "100%",
            }}
          >
            <Typography variant="caption">
              Adulto, Asiento A1 ida
            </Typography>
            <Typography variant="caption">
              Adulto, Asiento A1 vuelta
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          width: "100%",
        }}
      >
        <TextField
          label="Nombre(s)"
          fullWidth
          size="small"
        />
        <TextField
          label="Apellido(s)"
          fullWidth
          size="small"
        />
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
        >
          Limpiar
        </Button>
      </Box>
    </MotionPaper>
  );
};

export default PasajeroCard;
