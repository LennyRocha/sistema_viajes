"use client";

import React from "react";
import { PaperBlock } from "@nexoroute/commons";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import GoogleRouteMap from "../../viajes/components/GoogleRouteMap";
import ViajeBase from "../../viajes/types/ViajeBase";
import GeoPoint from "../../viajes/types/GeoPoint";
import { ConnectionSegment } from "../../viajes/utils/routeUtils";
import { InstitucionResumen } from "../types/SalidasApi";
import { TripCard } from "./SalidaCards";

export default function TripSelectionStep({
  instituciones,
  selectedInstitutionId,
  onInstitutionChange,
  search,
  onSearchChange,
  viajes,
  selectedViaje,
  connections,
  simulationPath,
  selectedViajeId,
  onSelectViaje,
}: Readonly<{
  instituciones: InstitucionResumen[];
  selectedInstitutionId: number | "all";
  onInstitutionChange: (value: number | "all") => void;
  search: string;
  onSearchChange: (value: string) => void;
  viajes: ViajeBase[];
  selectedViaje?: ViajeBase;
  connections: ConnectionSegment[];
  simulationPath: GeoPoint[];
  selectedViajeId?: number;
  onSelectViaje: (id: number) => void;
}>) {
  return (
    <PaperBlock
      title="Paso 1 - Selecciona viaje base"
      subtitle="La salida hereda rutas, paradas, duracion e imagen del viaje base."
      contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "220px minmax(0, 1fr)" },
          gap: 1,
        }}
      >
        <TextField
          select
          label="Institucion"
          value={selectedInstitutionId}
          onChange={(event) => {
            const value = event.target.value;
            onInstitutionChange(value === "all" ? "all" : Number(value));
          }}
          size="small"
        >
          <MenuItem value="all">Todas</MenuItem>
          {instituciones.map((institucion) => (
            <MenuItem key={institucion.id} value={institucion.id}>
              {institucion.nombre}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Buscar viaje"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "minmax(560px, 1.35fr) minmax(460px, 0.85fr)" },
          gap: 1.5,
          alignItems: "stretch",
        }}
      >
        {viajes.length === 0 ? (
          <Alert severity="info">
            No hay viajes base activos para la busqueda actual.
          </Alert>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
              gap: 1.25,
              alignContent: "start",
            }}
          >
            {viajes.map((viaje) => (
              <TripCard
                key={viaje.id}
                viaje={viaje}
                selected={selectedViajeId === viaje.id}
                onSelect={() => onSelectViaje(viaje.id)}
              />
            ))}
          </Box>
        )}
        <Stack spacing={1} sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 950 }}>
            Vista del viaje seleccionado
          </Typography>
          <GoogleRouteMap
            routes={selectedViaje?.rutas || []}
            connections={connections}
            height={430}
            title={selectedViaje?.nombre || "Viaje seleccionado"}
            enableSimulation={simulationPath.length > 1}
            simulationPath={simulationPath}
            emptyMessage="Selecciona un viaje para ver sus rutas"
          />
        </Stack>
      </Box>
    </PaperBlock>
  );
}
