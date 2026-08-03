"use client";

import React from "react";
import { PaperBlock } from "@nexoroute/commons";
import { Alert, Avatar, Box, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import GoogleRouteMap from "../../viajes/components/GoogleRouteMap";
import RutaBase from "../../viajes/types/RutaBase";
import GeoPoint from "../../viajes/types/GeoPoint";
import { ConnectionSegment } from "../../viajes/utils/routeUtils";

export default function RoutePricingStep({
  routes,
  connections,
  simulationPath,
  prices,
  onPriceChange,
  isValid,
}: Readonly<{
  routes: RutaBase[];
  connections: ConnectionSegment[];
  simulationPath: GeoPoint[];
  prices: Record<number, string>;
  onPriceChange: (routeId: number, value: string) => void;
  isValid: boolean;
}>) {
  return (
    <PaperBlock
      title="Paso 2 - Rutas y precios"
      subtitle="Confirma visualmente las rutas y captura el precio del boleto para cada tramo."
      contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
    >
      <GoogleRouteMap
        routes={routes}
        connections={connections}
        height={380}
        title="Render de rutas del viaje"
        enableSimulation={simulationPath.length > 1}
        simulationPath={simulationPath}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 1,
        }}
      >
        {routes.map((route, index) => (
          <Box
            key={route.id}
            sx={{
              p: 1.25,
              borderRadius: "8px",
              border: "1px solid",
              borderColor: "divider",
              display: "grid",
              gridTemplateColumns: { xs: "34px minmax(0, 1fr)", sm: "34px minmax(0, 1fr) 150px" },
              gap: 1,
              alignItems: "center",
            }}
          >
            <Avatar sx={{ width: 30, height: 30, bgcolor: route.color || "primary.main", fontSize: 13 }}>
              {index + 1}
            </Avatar>
            <Stack sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 950 }} noWrap>
                {route.nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {route.origen.nombre} - {route.destino.nombre}
              </Typography>
            </Stack>
            <TextField
              label="Precio"
              type="number"
              size="small"
              value={prices[route.id] || ""}
              onChange={(event) => onPriceChange(route.id, event.target.value)}
              sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                },
              }}
            />
          </Box>
        ))}
      </Box>
      {!isValid && (
        <Alert severity="warning">
          Todas las rutas deben tener un precio mayor a cero para continuar.
        </Alert>
      )}
    </PaperBlock>
  );
}
