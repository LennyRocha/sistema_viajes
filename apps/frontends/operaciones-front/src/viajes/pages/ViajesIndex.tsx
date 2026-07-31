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
  Pagination,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import GoogleRouteMap from "../components/GoogleRouteMap";
import ViajeDetails from "../components/ViajeDetails";
import { getViajesBasePage, useOperacionesData } from "../api/operacionesHttp";
import GeoPoint from "../types/GeoPoint";
import { mapRutaApi, mapViajeApi } from "../utils/apiMappers";
import {
  buildConnectionSegments,
  buildJourneySimulationPath,
  getJourneyMetrics,
} from "../utils/routeUtils";

interface Props extends CommonPageProps {}

const DEFAULT_VIAJE_IMAGE = "/imagen_defecto_viajes.jpg";
const EMPTY_ROUTES: ReturnType<typeof mapRutaApi>[] = [];

function JourneyInfoPanel({
  metrics,
  durationMin,
  ready,
  routes,
}: Readonly<{
  metrics: ReturnType<typeof getJourneyMetrics>;
  durationMin: number;
  ready: boolean;
  routes: ReturnType<typeof mapRutaApi>[];
}>) {
  const statItems = [
    { label: "Distancia", value: `${metrics.distanceKm.toFixed(1)} km` },
    { label: "Duracion", value: `${durationMin} min` },
    { label: "Paradas", value: String(metrics.stops) },
    { label: "Rutas", value: String(routes.length) },
  ];

  return (
    <Stack spacing={1.5}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: "8px",
          color: "white",
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(31,97,141,0.92))",
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.74, letterSpacing: 0 }}>
          Resumen operativo
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            mt: 0.5,
          }}
        >
          {statItems.map((item) => (
            <Box key={item.label}>
              <Typography variant="h6" sx={{ fontWeight: 950, lineHeight: 1 }}>
                {item.value}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          p: 1.25,
          borderRadius: "8px",
          border: "1px solid",
          borderColor: ready ? "success.light" : "warning.light",
          backgroundColor: ready
            ? "rgba(46, 125, 50, 0.08)"
            : "rgba(237, 108, 2, 0.08)",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {ready ? (
            <CheckCircleIcon color="success" fontSize="small" />
          ) : (
            <LinkOffIcon color="warning" fontSize="small" />
          )}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 900 }}>
              {ready ? "Recorrido continuo" : "Incluye enlace operativo"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {ready
                ? "Las rutas empatan en el orden seleccionado."
                : "El tramo punteado conecta el final de una ruta con el inicio de la siguiente."}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Stack spacing={1}>
        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
          Secuencia del viaje
        </Typography>
        {routes.map((ruta, index) => (
          <Box
            key={ruta.id}
            sx={{
              display: "grid",
              gridTemplateColumns: "28px 1fr auto",
              gap: 1,
              alignItems: "center",
              py: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: "white",
                fontSize: 12,
                fontWeight: 900,
                backgroundColor: ruta.color || "primary.main",
              }}
            >
              {index + 1}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 900 }}>
                {ruta.nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {ruta.origen.nombre} a {ruta.destino.nombre}
              </Typography>
            </Box>
            <Chip label={`${ruta.duracionMin || "-"} min`} size="small" />
          </Box>
        ))}
      </Stack>
    </Stack>
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
  const [viajeSearch, setViajeSearch] = React.useState("");
  const [viajePage, setViajePage] = React.useState(1);
  const [viajePageData, setViajePageData] = React.useState({
    total: 0,
    totalPages: 1,
  });
  const [pageViajes, setPageViajes] = React.useState(viajes);
  const [isLoadingViajePage, setIsLoadingViajePage] = React.useState(false);

  React.useEffect(() => {
    const timeout = window.setTimeout(async () => {
      setIsLoadingViajePage(true);
      try {
        const response = await getViajesBasePage({
          page: viajePage,
          limit: 5,
          search: viajeSearch,
          active: false,
        });
        const mapped = response.data.map(mapViajeApi);
        setPageViajes(mapped);
        setViajePageData({
          total: response.total,
          totalPages: response.totalPages,
        });
        if (!mapped.some((viaje) => viaje.id === selectedId)) {
          setSelectedId(mapped[0]?.id || null);
        }
      } catch {
        setPageViajes(viajes);
        setViajePageData({ total: viajes.length, totalPages: 1 });
      } finally {
        setIsLoadingViajePage(false);
      }
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [selectedId, viajePage, viajeSearch, viajes]);

  React.useEffect(() => {
    if (!selectedId && pageViajes[0]) setSelectedId(pageViajes[0].id);
  }, [pageViajes, selectedId]);

  const selectedViaje = pageViajes.find((viaje) => viaje.id === selectedId) || pageViajes[0];
  const selectedRoutes = selectedViaje?.rutas || EMPTY_ROUTES;
  const connections = React.useMemo(
    () => buildConnectionSegments(selectedRoutes),
    [selectedRoutes],
  );
  const [connectionOverrides, setConnectionOverrides] = React.useState<
    Map<string, { path: GeoPoint[]; distanceMeters: number }>
  >(() => new Map());
  const mergedConnections = React.useMemo(
    () =>
      connections.map((connection) => {
        const override = connectionOverrides.get(connection.id);
        return override
          ? { ...connection, path: override.path, distanceMeters: override.distanceMeters }
          : connection;
      }),
    [connectionOverrides, connections],
  );
  const metrics = React.useMemo(
    () => getJourneyMetrics(selectedRoutes, mergedConnections),
    [mergedConnections, selectedRoutes],
  );
  const journeySimulationPath = React.useMemo(
    () => buildJourneySimulationPath(selectedRoutes, mergedConnections),
    [mergedConnections, selectedRoutes],
  );
  const updateConnectionPath = React.useCallback(
    (connectionId: string, path: GeoPoint[], distanceMeters: number) => {
      setConnectionOverrides((current) => {
        const existing = current.get(connectionId);
        if (
          existing?.distanceMeters === distanceMeters &&
          existing.path.length === path.length
        ) {
          return current;
        }
        const next = new Map(current);
        next.set(connectionId, { path, distanceMeters });
        return next;
      });
    },
    [],
  );
  const ready = selectedRoutes.length > 0 && mergedConnections.length === 0;

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
        subtitle="Plantillas operativas compuestas por rutas reutilizables"
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
      ) : pageViajes.length === 0 ? (
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
            <TextField
              label="Buscar viaje"
              value={viajeSearch}
              onChange={(event) => {
                setViajeSearch(event.target.value);
                setViajePage(1);
              }}
              size="small"
              fullWidth
            />
            <Typography variant="caption" color="text.secondary">
              {isLoadingViajePage
                ? "Buscando viajes..."
                : `${viajePageData.total || pageViajes.length} viaje(s) encontrados`}
            </Typography>
            {pageViajes.map((viaje) => (
              <Box
                key={viaje.id}
                component="div"
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(viaje.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") setSelectedId(viaje.id);
                }}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  p: 0,
                  overflow: "hidden",
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
                <Box
                  component="img"
                  src={viaje.imagenBase64 || viaje.imagenUrl || DEFAULT_VIAJE_IMAGE}
                  alt={viaje.nombre}
                  sx={{
                    width: "100%",
                    height: 92,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <Box sx={{ p: 1.5 }}>
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
                  <Chip label={`${viaje.duracionTotalMin || Math.round(getJourneyMetrics(viaje.rutas, []).durationMin)} min`} size="small" />
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1.25, justifyContent: "flex-end" }}
                >
                  <Tooltip title="Ver detalle">
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        openSidebar({
                          title: "Detalle del viaje base",
                          children: <ViajeDetails viaje={viaje} />,
                        });
                      }}
                    >
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigationFunction(`/dashboard/trips/editar/${viaje.id}`);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
                </Box>
              </Box>
            ))}
            {viajePageData.totalPages > 1 && (
              <Pagination
                count={viajePageData.totalPages}
                page={viajePage}
                onChange={(_, page) => setViajePage(page)}
                color="primary"
                size="small"
              />
            )}
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
                connections={mergedConnections}
                height={560}
                title={ready ? "Viaje conectado" : "Viaje con enlace operativo pendiente"}
                enableStreetView
                enableSimulation={journeySimulationPath.length > 1}
                simulationPath={journeySimulationPath}
                onConnectionPathChange={updateConnectionPath}
                infoContent={
                  <JourneyInfoPanel
                    metrics={metrics}
                    durationMin={
                      selectedViaje?.duracionTotalMin || Math.round(metrics.durationMin)
                    }
                    ready={ready}
                    routes={selectedRoutes}
                  />
                }
              />
            </PaperBlock>
          </Box>
        </Box>
      )}
    </>
  );
}
