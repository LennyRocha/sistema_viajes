"use client";

import React from "react";
import {
  Breadcrumb,
  CommonPageProps,
  PaperBlock,
  PaperHeader,
  hasPrivilege,
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
  MenuItem,
  Pagination,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import GoogleRouteMap from "../components/GoogleRouteMap";
import ViajeDetails from "../components/ViajeDetails";
import {
  getViajesBasePage,
  toggleViajeBaseStatus,
  useOperacionesData,
} from "../api/operacionesHttp";
import GeoPoint from "../types/GeoPoint";
import {
  CatalogSortOption,
  CatalogStatusFilter,
} from "../types/OperacionesApi";
import { mapRutaApi, mapViajeApi } from "../utils/apiMappers";
import {
  buildConnectionSegments,
  buildJourneySimulationPath,
  getJourneyMetrics,
} from "../utils/routeUtils";

interface Props extends CommonPageProps {}

const DEFAULT_VIAJE_IMAGE = "/imagen_defecto_viajes.jpg";
const EMPTY_ROUTES: ReturnType<typeof mapRutaApi>[] = [];
const STATUS_OPTIONS: Array<{ value: CatalogStatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];
const SORT_OPTIONS: Array<{ value: CatalogSortOption; label: string }> = [
  { value: "recent", label: "Mas recientes" },
  { value: "oldest", label: "Mas antiguos" },
  { value: "name_asc", label: "Nombre A-Z" },
  { value: "name_desc", label: "Nombre Z-A" },
];

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
  showDialog,
  userPrivileges = [],
  userRoles = [],
}: Readonly<Props>) {
  const canCreate = hasPrivilege(userPrivileges, userRoles, "viaje-base:crear");
  const canEdit = hasPrivilege(userPrivileges, userRoles, "viaje-base:editar");
  const canDelete = hasPrivilege(userPrivileges, userRoles, "viaje-base:eliminar");
  const {
    viajes: viajesData,
    rutas: rutasData,
    isLoading: loadingViajes,
    isError,
    errorMessage,
    reload,
  } = useOperacionesData();

  const viajes = React.useMemo(() => viajesData.map(mapViajeApi), [viajesData]);
  const rutas = React.useMemo(() => rutasData.map(mapRutaApi), [rutasData]);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [viajeSearch, setViajeSearch] = React.useState("");
  const [statusFilter, setStatusFilter] =
    React.useState<CatalogStatusFilter>("all");
  const [sortOption, setSortOption] =
    React.useState<CatalogSortOption>("recent");
  const [viajePage, setViajePage] = React.useState(1);
  const [viajePageData, setViajePageData] = React.useState({
    total: 0,
    totalPages: 1,
  });
  const [pageViajes, setPageViajes] = React.useState(viajes);
  const [isLoadingViajePage, setIsLoadingViajePage] = React.useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = React.useState<number | null>(null);

  const loadViajesPage = React.useCallback(async () => {
    setIsLoadingViajePage(true);
    try {
      const response = await getViajesBasePage({
        page: viajePage,
        limit: 5,
        search: viajeSearch,
        active: false,
        status: statusFilter,
        sort: sortOption,
      });
      const mapped = response.data.map(mapViajeApi);
      setPageViajes(mapped);
      setViajePageData({
        total: response.total,
        totalPages: response.totalPages,
      });
      setSelectedId((current) =>
        current && mapped.some((viaje) => viaje.id === current)
          ? current
          : mapped[0]?.id || null,
      );
    } catch {
      setPageViajes(viajes);
      setViajePageData({ total: viajes.length, totalPages: 1 });
      setSelectedId((current) =>
        current && viajes.some((viaje) => viaje.id === current)
          ? current
          : viajes[0]?.id || null,
      );
    } finally {
      setIsLoadingViajePage(false);
    }
  }, [sortOption, statusFilter, viajePage, viajeSearch, viajes]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadViajesPage();
    }, 260);
    return () => window.clearTimeout(timeout);
  }, [loadViajesPage]);

  React.useEffect(() => {
    if (!selectedId && pageViajes[0]) setSelectedId(pageViajes[0].id);
  }, [pageViajes, selectedId]);

  React.useEffect(() => {
    setConnectionOverrides(new Map());
  }, [selectedId]);

  const handleToggleStatus = React.useCallback(
    async (viajeId: number) => {
      setStatusUpdatingId(viajeId);
      try {
        const updated = await toggleViajeBaseStatus(viajeId);
        snack?.success({
          message: `Viaje base ${updated.estatus ? "activado" : "desactivado"}`,
        });
        await reload();
        await loadViajesPage();
      } catch (error) {
        snack?.error({
          message:
            error instanceof Error
              ? `No se pudo cambiar el estatus: ${error.message}`
              : "No se pudo cambiar el estatus",
        });
      } finally {
        setStatusUpdatingId(null);
      }
    },
    [loadViajesPage, reload, snack],
  );
  const openStatusDialog = React.useCallback(
    (viaje: ReturnType<typeof mapViajeApi>) => {
      if (!showDialog) {
        void handleToggleStatus(viaje.id);
        return;
      }

      const nextStatusLabel = viaje.estatus ? "inactivo" : "activo";
      showDialog({
        title: "Confirmar cambio de estatus",
        content: (
          <Stack spacing={1.5} sx={{ minWidth: { sm: 360 } }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 900 }}>
                {viaje.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vas a cambiar este viaje base a estado {nextStatusLabel}.
              </Typography>
            </Box>
          </Stack>
        ),
        confirmText: viaje.estatus ? "Desactivar" : "Activar",
        cancelText: "Cancelar",
        showCancelButton: true,
        showCloseButton: true,
        closeDialogOnBackdropClick: true,
        submitOnEnter: true,
        onConfirm: async () => {
          await handleToggleStatus(viaje.id);
        },
        onClose: () => {},
      });
    },
    [handleToggleStatus, showDialog],
  );

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
        buttonDisabled={!canCreate}
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
            disabled={!canCreate}
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
              xl: "minmax(0, 1fr) 420px",
            },
            gap: 2,
            alignItems: "stretch",
            minHeight: {
              xs: "auto",
              xl: "calc(100vh - 190px)",
            },
          }}
        >
          <PaperBlock
            title="Viajes base"
            subtitle="Selecciona un viaje para revisar su recorrido y continuidad"
            paperProps={{
              sx: {
                minHeight: { xl: "calc(100vh - 190px)" },
                display: "flex",
                flexDirection: "column",
                order: { xs: 2, xl: 2 },
              },
            }}
            contentWrapperSx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 170px 190px" },
                gap: 1,
              }}
            >
              <Stack spacing={0.55}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, fontWeight: 800 }}>
                  Buscar
                </Typography>
                <TextField
                  placeholder="Buscar viaje"
                  value={viajeSearch}
                  onChange={(event) => {
                    setViajeSearch(event.target.value);
                    setViajePage(1);
                  }}
                  size="small"
                  fullWidth
                />
              </Stack>
              <Stack spacing={0.55}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, fontWeight: 800 }}>
                  Estatus
                </Typography>
                <TextField
                  select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as CatalogStatusFilter);
                    setViajePage(1);
                  }}
                  size="small"
                  fullWidth
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Stack spacing={0.55}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, fontWeight: 800 }}>
                  Ordenar
                </Typography>
                <TextField
                  select
                  value={sortOption}
                  onChange={(event) => {
                    setSortOption(event.target.value as CatalogSortOption);
                    setViajePage(1);
                  }}
                  size="small"
                  fullWidth
                >
                  {SORT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {isLoadingViajePage
                ? "Buscando viajes..."
                : `${viajePageData.total || pageViajes.length} viaje(s) encontrados`}
            </Typography>
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflow: "auto",
                pr: 0.25,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {pageViajes.length === 0 ? (
                <Alert severity="info">
                  No hubo coincidencias para los filtros actuales. Ajusta la busqueda, el estatus o el orden.
                </Alert>
              ) : (
                pageViajes.map((viaje) => (
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
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "112px minmax(0, 1fr) 58px",
                      minHeight: 92,
                    }}
                  >
                    <Box
                      component="img"
                      src={viaje.imagenBase64 || viaje.imagenUrl || DEFAULT_VIAJE_IMAGE}
                      alt={viaje.nombre}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <Box sx={{ p: 1, minWidth: 0 }}>
                      <Stack spacing={0.35}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <Typography
                            sx={{
                              fontWeight: 900,
                              lineHeight: 1.12,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {viaje.nombre}
                          </Typography>
                          <Chip
                            label={viaje.estatus ? "Activo" : "Inactivo"}
                            color={viaje.estatus ? "success" : "default"}
                            size="small"
                            variant="outlined"
                            sx={{ height: 22 }}
                          />
                        </Stack>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {viaje.descripcion || "Sin descripcion"}
                        </Typography>
                      </Stack>
                      <Divider sx={{ my: 0.75 }} />
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                        <Chip
                          icon={<RouteIcon />}
                          label={`${viaje.rutas.length} ruta(s)`}
                          size="small"
                          sx={{ height: 24 }}
                        />
                        <Chip
                          label={`${viaje.duracionTotalMin || Math.round(getJourneyMetrics(viaje.rutas, []).durationMin)} min`}
                          size="small"
                          sx={{ height: 24 }}
                        />
                      </Stack>
                    </Box>
                    <Stack
                      spacing={0.25}
                      sx={{
                        p: 0.5,
                        justifyContent: "center",
                        alignItems: "center",
                        borderLeft: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "rgba(255,255,255,0.62)",
                      }}
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
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canEdit && <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigationFunction(`/dashboard/trips/editar/${viaje.id}`);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>}
                      {canDelete && <Tooltip
                        title={viaje.estatus ? "Desactivar viaje base" : "Activar viaje base"}
                      >
                        <Box
                          onClick={(event) => event.stopPropagation()}
                          sx={{ display: "flex", justifyContent: "center" }}
                        >
                          <Switch
                            color="success"
                            checked={viaje.estatus}
                            disabled={statusUpdatingId === viaje.id}
                            onChange={() => openStatusDialog(viaje)}
                          />
                        </Box>
                      </Tooltip>}
                    </Stack>
                  </Box>
                </Box>
                ))
              )}
            </Box>
            {viajePageData.total > 0 && (
              <Box
                sx={{
                  pt: 0.5,
                  mt: "auto",
                  borderTop: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "background.paper",
                  display: "flex",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Pagination
                  count={Math.max(1, viajePageData.totalPages)}
                  page={viajePage}
                  onChange={(_, page) => setViajePage(page)}
                  color="primary"
                  size="small"
                />
              </Box>
            )}
          </PaperBlock>

          <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, order: { xs: 1, xl: 1 } }}>
            <PaperBlock
              title={selectedViaje?.nombre}
              subtitle="Mapa del viaje base seleccionado"
              paperProps={{
                sx: {
                  p: 0,
                  overflow: "hidden",
                  height: { xl: "calc(100vh - 178px)" },
                  minHeight: 590,
                },
              }}
              contentWrapperSx={{ p: 0 }}
            >
              <GoogleRouteMap
                key={`viaje-map-${selectedViaje?.id ?? "empty"}`}
                routes={selectedRoutes}
                connections={mergedConnections}
                height="calc(100vh - 220px)"
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
