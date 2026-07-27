"use client";

import React from "react";
import {
  Breadcrumb,
  CommonPageProps,
  PaperBlock,
  PaperHeader,
} from "@nexoroute/commons";
import {
  Add,
  CalendarMonth,
  Edit,
  Info,
  Route,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import GoogleRouteMap from "../components/GoogleRouteMap";
import ViajeDetails from "../components/ViajeDetails";
import { viajesBase } from "../data/viajesMock";
import ViajeBase from "../types/ViajeBase";

interface Props extends CommonPageProps {}

export default function ViajesIndex({
  navigationFunction,
  openSidebar,
  snack,
}: Readonly<Props>) {
  const [selectedViaje, setSelectedViaje] =
    React.useState<ViajeBase>(viajesBase[0]);

  const selectedPoints = React.useMemo(() => {
    const firstRoute = selectedViaje.rutas[0];
    if (!firstRoute) return [];

    return [
      firstRoute.origen,
      ...firstRoute.paradas,
      firstRoute.destino,
    ];
  }, [selectedViaje]);

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          {
            nombre: "Viajes",
            href: "/dashboard/trips",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Viajes base"
        subtitle="Composicion operativa de rutas, servicios y apertura en calendario"
        iconname="trip"
        showButton
        onButtonClick={() => navigationFunction("/dashboard/trips/nuevo")}
        buttonTitle="Nuevo"
        leftIcon={<Add />}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.2fr) minmax(360px, 0.8fr)",
          },
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {viajesBase.map((viaje) => (
            <PaperBlock
              key={viaje.id}
              title={viaje.nombre}
              subtitle={viaje.descripcion}
              paperProps={{
                sx: {
                  border:
                    selectedViaje.id === viaje.id
                      ? "1px solid"
                      : undefined,
                  borderColor:
                    selectedViaje.id === viaje.id
                      ? "primary.main"
                      : undefined,
                      padding: "12px",
                },
              }}
              contentWrapperSx={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap" }}
              >
                <Chip
                  label={viaje.estatus ? "Activo" : "Inactivo"}
                  color={viaje.estatus ? "success" : "default"}
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<Route />}
                  label={`${viaje.rutas.length} ruta(s)`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<CalendarMonth />}
                  label={viaje.proximaApertura}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="caption" color="textSecondary">
                  {viaje.frecuencia}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    aria-label="Ver detalles"
                    onClick={() =>
                      openSidebar({
                        title: "Detalles del viaje base",
                        children: <ViajeDetails viaje={viaje} />,
                      })
                    }
                  >
                    <Info />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Editar viaje base"
                    onClick={() =>
                      navigationFunction(`/dashboard/trips/editar/${viaje.id}`)
                    }
                  >
                    <Edit />
                  </IconButton>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() =>
                      snack?.success({
                        message:
                          "Salida generada en calendario (mock)",
                      })
                    }
                  >
                    Abrir viaje
                  </Button>
                  <Button
                    size="small"
                    variant={
                      selectedViaje.id === viaje.id
                        ? "contained"
                        : "outlined"
                    }
                    color="secondary"
                    onClick={() => setSelectedViaje(viaje)}
                  >
                    Ver ruta
                  </Button>
                </Box>
              </Box>
            </PaperBlock>
          ))}
        </Box>

        <PaperBlock
          title="Vista geografica"
          subtitle="Previsualizacion de origen, paradas y destino de la ruta principal"
          contentWrapperSx={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <GoogleRouteMap points={selectedPoints} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {selectedPoints.map((point, index) => (
              <Box
                key={`${point.nombre}-${index}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr",
                  gap: 1,
                  alignItems: "start",
                }}
              >
                <Chip label={index + 1} size="small" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {point.nombre}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {point.direccion}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </PaperBlock>
      </Box>
    </>
  );
}
