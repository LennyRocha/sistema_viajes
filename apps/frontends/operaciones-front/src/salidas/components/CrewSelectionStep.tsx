"use client";

import React from "react";
import { PaperBlock } from "@nexoroute/commons";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import PersonIcon from "@mui/icons-material/Person";
import { Alert, Avatar, Stack, Typography } from "@mui/material";
import VehicleModelPreview from "../../viajes/components/VehicleModelPreview";
import {
  AutobusResumen,
  ConductorResumen,
} from "../types/SalidasApi";
import {
  fullDriverName,
  vehicleModelFromBus,
} from "../utils/formatters";
import { SelectionCard } from "./SalidaCards";

export default function CrewSelectionStep({
  autobuses,
  conductores,
  selectedBus,
  selectedDriver,
  onSelectBus,
  onSelectDriver,
}: Readonly<{
  autobuses: AutobusResumen[];
  conductores: ConductorResumen[];
  selectedBus: AutobusResumen | null;
  selectedDriver: ConductorResumen | null;
  onSelectBus: (id: number) => void;
  onSelectDriver: (id: number) => void;
}>) {
  return (
    <PaperBlock
      title="Paso 4 - Unidad y conductor"
      subtitle="Selecciona autobus y conductor disponibles para la institucion."
      contentWrapperSx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <DirectionsBusIcon color="primary" />
          <Typography sx={{ fontWeight: 950 }}>Autobus</Typography>
        </Stack>
        {selectedBus && <VehicleModelPreview model={vehicleModelFromBus(selectedBus)} />}
        {autobuses.length === 0 ? (
          <Alert severity="info">
            No hay autobuses activos para la institucion seleccionada.
          </Alert>
        ) : (
          autobuses.map((bus) => (
            <SelectionCard
              key={bus.id}
              selected={selectedBus?.id === bus.id}
              title={`${bus.alias || bus.codigo_interno || `Bus ${bus.id}`} - ${bus.marca || "Marca"} ${bus.modelo || ""}`}
              subtitle={`${bus.tipoAutobus?.nombre || "Tipo sin clasificar"} - ${bus.capacidad || 0} asientos`}
              meta={bus.estado ? `Estado: ${bus.estado}` : undefined}
              avatar={
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <DirectionsBusIcon />
                </Avatar>
              }
              onClick={() => bus.id && onSelectBus(bus.id)}
            />
          ))
        )}
      </Stack>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <PersonIcon color="primary" />
          <Typography sx={{ fontWeight: 950 }}>Conductor</Typography>
        </Stack>
        {conductores.length === 0 ? (
          <Alert severity="info">
            No hay conductores activos para la institucion seleccionada.
          </Alert>
        ) : (
          conductores.map((driver) => (
            <SelectionCard
              key={driver.id}
              selected={selectedDriver?.id === driver.id}
              title={fullDriverName(driver)}
              subtitle={driver.email || driver.telefono || "Sin contacto registrado"}
              meta={driver.licencia ? "Licencia vigente registrada" : "Sin licencia en respuesta"}
              avatar={
                <Avatar src={driver.foto_perfil || undefined} sx={{ bgcolor: "secondary.main" }}>
                  {driver.nombres?.[0] || "C"}
                </Avatar>
              }
              onClick={() => onSelectDriver(driver.id)}
            />
          ))
        )}
      </Stack>
    </PaperBlock>
  );
}
