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

const PasajeroCard = ({
  numero,
  asiento,
  nombre,
  apellido,
  setNombre,
  setApellido,
}) => {
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
        <Typography variant="h5">
          Pasajero 0{numero}
        </Typography>
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
              Adulto, Asiento {asiento} ida
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
          value={nombre}
          onChange={(e) => {
            const value = e.target.value.replace(
              /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
              "",
            );
            setNombre(value);
          }}
          slotProps={{
            htmlInput: {
              maxLength: 50,
            },
          }}
        />
        <TextField
          label="Apellido(s)"
          fullWidth
          size="small"
          value={apellido}
          onChange={(e) => {
            const value = e.target.value.replace(
              /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
              "",
            );
            setApellido(value);
          }}
          slotProps={{
            htmlInput: {
              maxLength: 50,
            },
          }}
        />
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={() => {
            setNombre("");
            setApellido("");
          }}
          disabled={nombre === "" && apellido === ""}
        >
          Limpiar
        </Button>
      </Box>
    </MotionPaper>
  );
};

export default PasajeroCard;
