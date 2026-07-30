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
                component="button"
                onClick={() => setSelectedId(viaje.id)}
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
                {(viaje.imagenBase64 || viaje.imagenUrl) && (
                  <Box
                    component="img"
                    src={viaje.imagenBase64 || viaje.imagenUrl || ""}
                    alt={viaje.nombre}
                    sx={{
                      width: "100%",
                      height: 92,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                )}
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
                connections={connections}
                height={560}
                title={ready ? "Viaje conectado" : "Viaje con enlace operativo pendiente"}
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
              <MetricCard label="Duracion" value={`${selectedViaje?.duracionTotalMin || Math.round(metrics.durationMin)} min`} accent="#b7791f" />
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
                  label={ready ? "Continuidad valida" : "Usa enlace operativo"}
                  color={ready ? "success" : "warning"}
                  variant="outlined"
                />
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
