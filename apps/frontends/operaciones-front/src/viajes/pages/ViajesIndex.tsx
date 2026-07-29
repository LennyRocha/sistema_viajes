"use client";

import React from "react";
import {
  Breadcrumb,
  CommonPageProps,
  PaperBlock,
  PaperHeader,
} from "@nexoroute/commons";
import AddIcon from "@mui/icons-material/Add";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import RouteIcon from "@mui/icons-material/Route";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import GoogleRouteMap from "../components/GoogleRouteMap";
import ViajeDetails from "../components/ViajeDetails";
import { rutasBase, viajesBase } from "../data/viajesMock";
import ViajeBase from "../types/ViajeBase";
import RutaBase from "../types/RutaBase";
import {
  CONNECTION_TOLERANCE_METERS,
  buildConnectionSegments,
  formatMeters,
  getJourneyMetrics,
} from "../utils/routeUtils";

interface Props extends CommonPageProps {}

function toggleRoute(current: RutaBase[], route: RutaBase) {
  if (current.some((item) => item.id === route.id)) {
    return current.filter((item) => item.id !== route.id);
  }
  return [...current, route];
}

function MetricTile({
  label,
  value,
  accent,
}: Readonly<{ label: string; value: string; accent: string }>) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        borderLeft: `4px solid ${accent}`,
        minHeight: 74,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.15 }}>
        {value}
      </Typography>
    </Box>
  );
}

function RouteCard({
  route,
  selected,
  onClick,
}: Readonly<{
  route: RutaBase;
  selected: boolean;
  onClick: () => void;
}>) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        width: "100%",
        textAlign: "left",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        borderRadius: "8px",
        backgroundColor: selected ? "rgba(31, 97, 141, 0.08)" : "background.paper",
        cursor: "pointer",
        p: 1.5,
        display: "grid",
        gridTemplateColumns: "12px 1fr auto",
        gap: 1.25,
        alignItems: "center",
        transition: "border-color 160ms ease, background-color 160ms ease, transform 160ms ease",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box
        sx={{
          width: 12,
          height: 52,
          borderRadius: "8px",
          backgroundColor: route.color || "primary.main",
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>
          {route.nombre}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {route.origen.nombre} a {route.destino.nombre}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          {route.descripcion}
        </Typography>
      </Box>
      <Stack spacing={0.75} sx={{ alignItems: "flex-end" }}>
        <Chip
          label={`${route.distanciaKm} km`}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`${route.duracionMin} min`}
          size="small"
          variant="outlined"
        />
      </Stack>
    </Box>
  );
}

export default function ViajesIndex({
  navigationFunction,
  openSidebar,
  snack,
}: Readonly<Props>) {
  const [selectedRoutes, setSelectedRoutes] = React.useState<RutaBase[]>([
    rutasBase[0],
    rutasBase[3],
  ]);
  const [selectedViaje, setSelectedViaje] = React.useState<ViajeBase>(
    viajesBase[3] || viajesBase[0],
  );

  const connections = React.useMemo(
    () => buildConnectionSegments(selectedRoutes, CONNECTION_TOLERANCE_METERS),
    [selectedRoutes],
  );
  const metrics = React.useMemo(
    () => getJourneyMetrics(selectedRoutes, connections),
    [selectedRoutes, connections],
  );
  const isValid = selectedRoutes.length > 0 && connections.length === 0;
  const validationProgress = selectedRoutes.length === 0 ? 0 : isValid ? 100 : 58;

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
        title="Viajes"
        subtitle="Compone viajes base con rutas reutilizables, valida conexiones y abre salidas en calendario"
        iconname="trip"
        showButton
        onButtonClick={() => navigationFunction("/dashboard/trips/nuevo")}
        buttonTitle="Nuevo viaje"
        leftIcon={<AddIcon />}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            xl: "360px minmax(0, 1fr) 360px",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <PaperBlock
          title="Rutas guardadas"
          subtitle="Selecciona una o varias rutas en el orden operativo del viaje"
          contentMaxHeight={720}
          contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1 }}
        >
          {rutasBase.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              selected={selectedRoutes.some((item) => item.id === route.id)}
              onClick={() => setSelectedRoutes((current) => toggleRoute(current, route))}
            />
          ))}
        </PaperBlock>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <PaperBlock
            title="Composicion geografica"
            subtitle="El mapa muestra rutas seleccionadas y enlaces necesarios entre trayectos"
            paperProps={{
              sx: {
                p: 0,
                overflow: "hidden",
              },
            }}
            contentWrapperSx={{ p: 0 }}
          >
            <GoogleRouteMap
              routes={selectedRoutes}
              connections={connections}
              height={520}
              title={isValid ? "Viaje listo para calendario" : "Viaje con enlaces por resolver"}
            />
          </PaperBlock>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(4, 1fr)",
              },
              gap: 1.5,
            }}
          >
            <MetricTile
              label="Distancia total"
              value={`${metrics.distanceKm.toFixed(1)} km`}
              accent="#1f618d"
            />
            <MetricTile
              label="Tiempo estimado"
              value={`${Math.round(metrics.durationMin)} min`}
              accent="#b7791f"
            />
            <MetricTile
              label="Paradas"
              value={String(metrics.stops)}
              accent="#2f855a"
            />
            <MetricTile
              label="Rutas"
              value={String(selectedRoutes.length)}
              accent="#6b46c1"
            />
          </Box>

          <PaperBlock
            title="Validacion operativa"
            subtitle={`Tolerancia actual: ${CONNECTION_TOLERANCE_METERS} m entre destino y siguiente origen`}
            contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Chip
                icon={isValid ? <CheckCircleIcon /> : <LinkOffIcon />}
                label={isValid ? "Rutas conectadas" : "Requiere enlace operativo"}
                color={isValid ? "success" : "warning"}
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary">
                {isValid
                  ? "El viaje puede abrirse en calendario sin trayectos extra."
                  : "El sistema propone enlaces entre rutas separadas para que el autobus llegue al siguiente origen."}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={validationProgress}
              color={isValid ? "success" : "warning"}
              sx={{ height: 8, borderRadius: 8 }}
            />
            {connections.length > 0 && (
              <Stack spacing={1}>
                {connections.map((segment) => (
                  <Box
                    key={segment.id}
                    sx={{
                      p: 1.25,
                      borderRadius: "8px",
                      border: "1px dashed",
                      borderColor: "warning.main",
                      backgroundColor: "rgba(237, 137, 54, 0.08)",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {segment.from.nombre} a {segment.to.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Enlace sugerido de {formatMeters(segment.distanceMeters)}. Mas adelante podras editar el trazo en el mapa.
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </PaperBlock>
        </Box>

        <PaperBlock
          title="Viajes base"
          subtitle="Plantillas listas para abrir salidas en calendario"
          contentMaxHeight={720}
          contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1 }}
        >
          {viajesBase.map((viaje) => (
            <Box
              key={viaje.id}
              sx={{
                p: 1.5,
                borderRadius: "8px",
                border: "1px solid",
                borderColor: selectedViaje.id === viaje.id ? "primary.main" : "divider",
                backgroundColor:
                  selectedViaje.id === viaje.id
                    ? "rgba(31, 97, 141, 0.06)"
                    : "background.paper",
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "space-between" }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>{viaje.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {viaje.descripcion}
                  </Typography>
                </Box>
                <Chip
                  label={viaje.estatus ? "Activo" : "Inactivo"}
                  color={viaje.estatus ? "success" : "default"}
                  size="small"
                  variant="outlined"
                />
              </Stack>
              <Divider sx={{ my: 1.25 }} />
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                <Chip icon={<RouteIcon />} label={`${viaje.rutas.length} ruta(s)`} size="small" />
                <Chip icon={<CalendarMonthIcon />} label={viaje.proximaApertura} size="small" />
              </Stack>
              <Stack direction="row" spacing={0.75} sx={{ mt: 1.25 }}>
                <Button
                  size="small"
                  variant={selectedViaje.id === viaje.id ? "contained" : "outlined"}
                  onClick={() => {
                    setSelectedViaje(viaje);
                    setSelectedRoutes(viaje.rutas);
                  }}
                  startIcon={<AltRouteIcon />}
                >
                  Pintar
                </Button>
                <Tooltip title="Ver detalles">
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
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    aria-label="Editar viaje base"
                    onClick={() =>
                      navigationFunction(`/dashboard/trips/editar/${viaje.id}`)
                    }
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  disabled={!viaje.estatus}
                  onClick={() =>
                    snack?.success({
                      message: "Salida generada en calendario",
                    })
                  }
                >
                  Abrir
                </Button>
              </Stack>
            </Box>
          ))}
        </PaperBlock>
      </Box>
    </>
  );
}
