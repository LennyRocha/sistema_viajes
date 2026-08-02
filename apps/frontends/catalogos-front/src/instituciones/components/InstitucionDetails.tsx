import { Box, Divider, Typography } from "@mui/material";
import Institucion from "../types/Institucion";
import Image from "next/image";

type Props = {
  row: Institucion;
};

export default function InstitucionDetails({
  row,
}: Readonly<Props>) {
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
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: 150,
          }}
        >
          <Image
            src={row.imagen_url.trim()}
            alt="logo"
            fill
            style={{ objectFit: "contain" }}
            sizes="(max-width: 600px) 100vw, 50vw"
          />
        </Box>
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
        Esta informacion pertenece al catalogo de
        instituciones disponibles para asignacion de
        unidades y servicios.
      </Typography>
    </Box>
  );
}
