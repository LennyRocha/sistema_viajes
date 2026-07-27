import React from "react";
import {
  Box,
  Chip,
  Divider,
  Skeleton,
  Typography,
} from "@mui/material";
import tiposBus from "../../tipos_autobus/constants/TiposBusMapper";
import dynamic from "next/dynamic";
import { BusTablaType } from "../types/BusTablaType";
import ServicioExterno from "../../servicios/types/ServicioExterno";
import { ServicioIcon } from "@nexoroute/commons";
import AutobusServicio from "../types/AutobusServicio";
import { AnimatePresence, motion } from "framer-motion";
const Vehiculo3D = dynamic(
  () =>
    import("../../federation").then(
      (mod) => mod.Vehiculo3D,
    ),
  {
    ssr: false,
    loading: () => (
      <Skeleton
        variant="rounded"
        width="100%"
        height={100}
      />
    ), // o un skeleton
  },
);

type Props = {
  row: BusTablaType;
  servicios: ServicioExterno[];
};

const BusDetails = ({ row, servicios }: Props) => {
  const findServicio = (id: number) => {
    const servicio = servicios.find(
      (servicio) => servicio.id === id,
    );
    return servicio;
  };
  const [selectedServicio, setSelectedServicio] =
    React.useState<AutobusServicio | null>(null);
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
          Tipo: {row.tipoAutobus.nombre}
        </Typography>
        <Vehiculo3D
          tipo={tiposBus[row.tipoAutobus.id - 1].model}
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
          Estado: {row.autobus_estado}
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
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              width: "100%",
            }}
          >
            {row.servicios.map((servicio) => {
              const service = findServicio(
                servicio.servicio_id ?? -1,
              );
              return selectedServicio?.servicio_id ===
                servicio.servicio_id ? (
                <Chip
                  sx={{
                    paddingLeft: 1.5,
                  }}
                  key={servicio.id}
                  label={service?.nombre ?? ""}
                  variant={"outlined"}
                  color={"accent"}
                  icon={
                    <ServicioIcon
                      size="xs"
                      name={service?.icono_nombre ?? ""}
                    />
                  }
                  onDelete={() => setSelectedServicio(null)}
                />
              ) : (
                <Chip
                  sx={{
                    paddingLeft: 1.5,
                  }}
                  key={servicio.id}
                  label={service?.nombre ?? ""}
                  variant={"outlined"}
                  color={"secondary"}
                  icon={
                    <ServicioIcon
                      size="xs"
                      name={service?.icono_nombre ?? ""}
                    />
                  }
                  onClick={() => {
                    setSelectedServicio(null);
                    setTimeout(
                      () => setSelectedServicio(servicio),
                      300,
                    );
                  }}
                />
              );
            })}
          </Box>
          <Divider />
          <AnimatePresence mode="wait">
            {selectedServicio && (
              <motion.div
                key={selectedServicio.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {Object.entries(
                  selectedServicio.config_servicio ?? {},
                ).map(([key, value]) => (
                  <Typography key={key} variant="caption">
                    {key}: {isBooleanOrValue(value)}
                  </Typography>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      )}
    </Box>
  );
};

export default BusDetails;

function isBooleanOrValue(value: any): string {
  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }
  return String(value);
}
