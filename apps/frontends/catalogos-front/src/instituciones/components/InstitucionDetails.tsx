import { Box, Divider, Typography } from "@mui/material";
import Institucion from "../types/Institucion";

type Props = {
  row: Institucion;
};

export default function InstitucionDetails({ row }: Readonly<Props>) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: 600 }}
        >
          Datos generales
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Nombre: {row.nombre}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Descripcion: {row.descripcion}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Estado: {row.estatus ? "Activa" : "Inactiva"}
        </Typography>
      </Box>
      <Divider />
      <Typography
        variant="caption"
        color="textSecondary"
        sx={{ fontStyle: "italic" }}
      >
        Esta informacion pertenece al catalogo de instituciones
        disponibles para asignacion de unidades y servicios.
      </Typography>
    </Box>
  );
}
