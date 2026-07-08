import React from "react";
import Autobus from "../types/Autobus";
import { Box, Divider, Typography } from "@mui/material";
import tiposBus from "../../tipos_autobus/constants/TiposBusMapper";
import dynamic from "next/dynamic";
const Vehiculo3D = dynamic(
  () =>
    import("../../federation").then(
      (mod) => mod.Vehiculo3D,
    ),
  {
    ssr: false,
    loading: () => <div>Cargando modelo 3D...</div>, // o un skeleton
  },
);

type Props = {
  row: Autobus;
};

const BusDetails = ({ row }: Props) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {" "}
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
          Datos generales
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Alias del autobus: {row.alias}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Código interno: {row.codigo_interno}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Descripción: {row.descripcion}
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
          Datos administrativos
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Institución propietaria: {row.institucion.nombre}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Tipo: {row.tipo.nombre}
        </Typography>
        <Vehiculo3D
          tipo={tiposBus[row.tipo.id - 1].model}
        />
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            fontStyle: "italic",
            fontSize: "0.75rem",
          }}
        >
          <b>NOTA:</b> No representa el modelo real del
          vehículo, pero si representa uno de los tipos de
          autobuses disponibles
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
          Datos del vehículo
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Marca: {row.alias}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Modelo: {row.codigo_interno}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Año: {row.ano}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Color: {row.color}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Capacidad total: {row.capacidad}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Estado: {row.estado}
        </Typography>
        <Divider />
      </Box>
      {row.servicios && (
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
            Servicios disponibles
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
          >
            {row.servicios
              .map((servicio) => servicio.activo)
              .join(", ")}
          </Typography>
          <Divider />
        </Box>
      )}
    </Box>
  );
};

export default BusDetails;
