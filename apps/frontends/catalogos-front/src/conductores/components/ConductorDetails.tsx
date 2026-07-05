import React from "react";
import Conductor from "../types/Conductor";
import { Box, Divider, Typography } from "@mui/material";

type Props = {
  row: Conductor;
};

const ConductorDetails = ({ row }: Props) => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: "600" }}
        >
          Datos personales
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Nombre: {row.nombre} {row.apellido}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Cédula: {row.curp}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Email: {row.email}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Teléfono: {row.telefono}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Fecha de nacimiento: {new Date(row.fecha_nacimiento).toLocaleDateString()}
        </Typography>
        <Divider />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: "600" }}
        >
          Licencia
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Número: {row.licencia.numeroLicencia}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Expedida: {new Date(row.licencia.fechaExpedicion).toLocaleDateString()}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Vence: {new Date(row.licencia.fechaVencimiento).toLocaleDateString()}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Estado emisor: {row.licencia.estadoEmisor}
        </Typography>
        <Divider />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: "600" }}
        >
          Información administrativa
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Institución: {row.institucion.nombre}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Estado: {row.estado}
        </Typography>
      </Box>
    </>
  );
};

export default ConductorDetails;