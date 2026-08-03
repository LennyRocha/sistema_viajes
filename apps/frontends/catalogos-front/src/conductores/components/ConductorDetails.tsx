import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import Conductor from "../types/Conductor";

type Props = {
  row: Conductor;
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "Sin fecha";

const ConductorDetails = ({ row }: Props) => {
  const nombreCompleto = [
    row.nombres,
    row.apellido_paterno,
    row.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ");

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
        <Typography variant="h6" color="secondary" sx={{ fontWeight: 600 }}>
          Datos personales
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Nombre: {nombreCompleto}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          CURP: {row.curp}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Email: {row.email}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Telefono: {row.telefono}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Fecha de nacimiento: {formatDate(row.fecha_nacimiento)}
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
        <Typography variant="h6" color="secondary" sx={{ fontWeight: 600 }}>
          Licencia
        </Typography>
        {row.licencia ? (
          <>
            <Typography variant="caption" color="textSecondary">
              Numero: {row.licencia.numero_licencia}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Expedida: {formatDate(row.licencia.fecha_expedicion)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Vence: {formatDate(row.licencia.fecha_vencimiento)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Estado emisor: {row.licencia.estado_emisor}
            </Typography>
          </>
        ) : (
          <Typography variant="caption" color="textSecondary">
            Sin licencia registrada
          </Typography>
        )}
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
        <Typography variant="h6" color="secondary" sx={{ fontWeight: 600 }}>
          Informacion administrativa
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Institucion: {row.institucion?.nombre || "Sin institucion"}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Estado: {row.estatus ? "Activo" : "Inactivo"}
        </Typography>
      </Box>
    </>
  );
};

export default ConductorDetails;
