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
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import GoogleRouteMap from "../components/GoogleRouteMap";
import ViajeDetails from "../components/ViajeDetails";
import { useOperacionesData } from "../api/operacionesHttp";
import { mapRutaApi, mapViajeApi } from "../utils/apiMappers";
import { buildConnectionSegments, getJourneyMetrics } from "../utils/routeUtils";

interface Props extends CommonPageProps {}

function MetricCard({
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
        borderLeft: `4px solid ${accent}`,
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function ViajesIndex({
  navigationFunction,
  openSidebar,
  snack,
}: Readonly<Props>) {
  const {
    viajes: viajesData,
    rutas: rutasData,
    isLoading: loadingViajes,
    isError,
    errorMessage,
  } = useOperacionesData();

  const viajes = React.useMemo(() => viajesData.map(mapViajeApi), [viajesData]);
  const rutas = React.useMemo(() => rutasData.map(mapRutaApi), [rutasData]);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!selectedId && viajes[0]) setSelectedId(viajes[0].id);
  }, [selectedId, viajes]);

  const selectedViaje = viajes.find((viaje) => viaje.id === selectedId) || viajes[0];
  const selectedRoutes = selectedViaje?.rutas || [];
  const connections = React.useMemo(
    () => buildConnectionSegments(selectedRoutes),
    [selectedRoutes],
  );
  const metrics = React.useMemo(
    () => getJourneyMetrics(selectedRoutes, connections),
    [connections, selectedRoutes],
  );
  const ready = selectedRoutes.length > 0 && connections.length === 0;

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          { nombre: "Viajes", href: "/dashboard/trips", disabled: true },
        ]}
      />
      <PaperHeader
        title="Viajes"
        subtitle="Plantillas operativas para abrir salidas: primero eliges el viaje, luego revisas su recorrido"
        iconname="trip"
        showButton
        onButtonClick={() => navigationFunction("/dashboard/trips/nuevo")}
        buttonTitle="Nuevo viaje"
        leftIcon={<AddIcon />}
      />

      {isError && (
        <Alert severity="error">
          {errorMessage ||
            "No se pudo conectar con operaciones-service. Revisa que el backend este levantado en el gateway."}
        </Alert>
      )}

      {loadingViajes ? (
        <PaperBlock>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <CircularProgress size={22} />
            <Typography>Cargando viajes desde backend...</Typography>
          </Stack>
        </PaperBlock>
      ) : viajes.length === 0 ? (
        <PaperBlock
          title="Aun no hay viajes base"
          subtitle="Crea primero rutas reutilizables y despues arma un viaje base con ellas"
          contentWrapperSx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigationFunction("/dashboard/trips/nuevo")}
          >
            Crear primer viaje
          </Button>
          <Chip label={`${rutas.length} ruta(s) disponibles`} />
        </PaperBlock>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              xl: "420px minmax(0, 1fr)",
            },
            gap: 2,
            alignItems: "start",
          }}
        >
          <PaperBlock
            title="Viajes base"
            subtitle="Selecciona un viaje para revisar su recorrido y continuidad"
            contentMaxHeight={760}
            contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            {viajes.map((viaje) => (
              <Box
                key={viaje.id}
                component="button"
                onClick={() => setSelectedId(viaje.id)}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  p: 1.5,
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: selectedViaje?.id === viaje.id ? "primary.main" : "divider",
                  backgroundColor:
                    selectedViaje?.id === viaje.id
                      ? "rgba(31, 97, 141, 0.07)"
                      : "background.paper",
                  cursor: "pointer",
                }}
              >
                <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between" }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 900 }}>{viaje.nombre}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {viaje.descripcion || "Sin descripcion"}
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
                  <Chip icon={<CalendarMonthIcon />} label={viaje.frecuencia} size="small" />
                </Stack>
              </Box>
            ))}
          </PaperBlock>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <PaperBlock
              title={selectedViaje?.nombre}
              subtitle="Mapa del viaje base seleccionado"
              paperProps={{ sx: { p: 0, overflow: "hidden" } }}
              contentWrapperSx={{ p: 0 }}
            >
              <GoogleRouteMap
                routes={selectedRoutes}
                connections={connections}
                height={560}
                title={ready ? "Viaje listo para calendario" : "Viaje con enlace operativo pendiente"}
                enableStreetView
              />
            </PaperBlock>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
                gap: 1.5,
              }}
            >
              <MetricCard label="Distancia" value={`${metrics.distanceKm.toFixed(1)} km`} accent="#1f618d" />
              <MetricCard label="Tiempo" value={`${Math.round(metrics.durationMin)} min`} accent="#b7791f" />
              <MetricCard label="Paradas" value={String(metrics.stops)} accent="#2f855a" />
              <MetricCard label="Rutas" value={String(selectedRoutes.length)} accent="#6b46c1" />
            </Box>

            <PaperBlock
              title="Continuidad del viaje"
              subtitle="Las rutas internas se revisan en orden; si no empatan, el sistema marca el enlace"
              contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.25 }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <Chip
                  icon={ready ? <CheckCircleIcon /> : <LinkOffIcon />}
                  label={ready ? "Continuidad valida" : "Requiere enlace"}
                  color={ready ? "success" : "warning"}
                  variant="outlined"
                />
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  disabled={!selectedViaje?.estatus || selectedRoutes.length === 0}
                  onClick={() =>
                    snack?.success({
                      message: "La apertura de salidas requiere el modulo de calendario.",
                    })
                  }
                >
                  Abrir salida
                </Button>
                {selectedViaje && (
                  <>
                    <Tooltip title="Ver detalle">
                      <IconButton
                        size="small"
                        onClick={() =>
                          openSidebar({
                            title: "Detalle del viaje base",
                            children: <ViajeDetails viaje={selectedViaje} />,
                          })
                        }
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigationFunction(`/dashboard/trips/editar/${selectedViaje.id}`)
                        }
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Stack>
              {selectedRoutes.map((ruta, index) => (
                <Box
                  key={ruta.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "12px 32px 1fr",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ width: 10, height: 44, borderRadius: 8, backgroundColor: ruta.color }} />
                  <Chip label={index + 1} size="small" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {ruta.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ruta.origen.nombre} a {ruta.destino.nombre}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </PaperBlock>
          </Box>
        </Box>
      )}
    </>
  );
}
