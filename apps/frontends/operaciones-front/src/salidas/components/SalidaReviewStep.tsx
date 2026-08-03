"use client";

import React from "react";
import { PaperBlock } from "@nexoroute/commons";
import { Alert, Box, Divider, Stack, Typography } from "@mui/material";
import ViajeBase from "../../viajes/types/ViajeBase";
import RutaBase from "../../viajes/types/RutaBase";
import {
  AutobusResumen,
  ConductorResumen,
  TipoSalida,
} from "../types/SalidasApi";
import {
  formatCurrency,
  formatDuration,
  fullDriverName,
} from "../utils/formatters";
import {
  RecurringSchedule,
  SingleSchedule,
  SpecialOccurrence,
  scheduleSummary,
} from "../utils/schedule";
import { StatCard } from "./SalidaCards";

export default function SalidaReviewStep({
  viaje,
  routes,
  prices,
  tipoSalida,
  single,
  recurring,
  special,
  durationMin,
  selectedBus,
  selectedDriver,
  totalPrice,
  distanceKm,
}: Readonly<{
  viaje?: ViajeBase;
  routes: RutaBase[];
  prices: Record<number, string>;
  tipoSalida: TipoSalida;
  single: SingleSchedule;
  recurring: RecurringSchedule;
  special: SpecialOccurrence[];
  durationMin: number;
  selectedBus: AutobusResumen | null;
  selectedDriver: ConductorResumen | null;
  totalPrice: number;
  distanceKm: number;
}>) {
  return (
    <PaperBlock
      title="Paso 5 - Resumen"
      subtitle="Revisa la programacion antes de publicar la salida."
      contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
          gap: 1,
        }}
      >
        <StatCard label="Viaje" value={viaje?.nombre || "Pendiente"} />
        <StatCard
          label="Horario"
          value={scheduleSummary(tipoSalida, single, recurring, special, durationMin)}
        />
        <StatCard
          label="Unidad"
          value={selectedBus?.alias || selectedBus?.codigo_interno || "Pendiente"}
        />
        <StatCard label="Total rutas" value={formatCurrency(totalPrice)} color="success.main" />
      </Box>

      <Divider />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 1.5 }}>
        <Stack spacing={1}>
          <Typography sx={{ fontWeight: 950 }}>Precios por ruta</Typography>
          {routes.map((route, index) => (
            <Stack
              key={route.id}
              direction="row"
              sx={{
                justifyContent: "space-between",
                p: 1,
                borderRadius: "8px",
                bgcolor: "background.default",
              }}
            >
              <Typography variant="body2">
                {index + 1}. {route.nombre}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 950 }}>
                {formatCurrency(Number(prices[route.id]) || 0)}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Stack spacing={1}>
          <Typography sx={{ fontWeight: 950 }}>Asignacion</Typography>
          <Alert severity="info">
            Se guardara como PROGRAMADO. La configuracion de horario queda lista para que Calendario liste salidas despues.
          </Alert>
          <Typography variant="body2">
            Conductor: <strong>{fullDriverName(selectedDriver)}</strong>
          </Typography>
          <Typography variant="body2">
            Autobus: <strong>{selectedBus?.marca || ""} {selectedBus?.modelo || ""}</strong>
          </Typography>
          <Typography variant="body2">
            Distancia: <strong>{distanceKm.toFixed(1)} km</strong>
          </Typography>
          <Typography variant="body2">
            Duracion base: <strong>{formatDuration(durationMin)}</strong>
          </Typography>
        </Stack>
      </Box>
    </PaperBlock>
  );
}
