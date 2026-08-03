"use client";

import React from "react";
import {
  Breadcrumb,
  CommonPageProps,
  PaperBlock,
  PaperHeader,
} from "@nexoroute/commons";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import RouteIcon from "@mui/icons-material/Route";
import SaveIcon from "@mui/icons-material/Save";
import TimerIcon from "@mui/icons-material/Timer";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Pagination,
} from "@mui/material";
import GoogleRouteMap from "../components/GoogleRouteMap";
import RutaDesigner from "../components/RutaDesigner";
import {
  createViajeBase,
  getViajeBase,
  getRutasPage,
  updateViajeBase,
  useOperacionesData,
} from "../api/operacionesHttp";
import GeoPoint from "../types/GeoPoint";
import {
  CatalogSortOption,
} from "../types/OperacionesApi";
import RutaBase from "../types/RutaBase";
import { isGoogleStreetViewImage, mapRutaApi, mapViajeApi } from "../utils/apiMappers";
import {
  buildConnectionSegments,
  buildJourneySimulationPath,
  getJourneyMetrics,
} from "../utils/routeUtils";

interface Props extends CommonPageProps {
  viajeId?: string;
}

const DEFAULT_VIAJE_IMAGE = "/imagen_defecto_viajes.jpg";
const EMPTY_ROUTES: RutaBase[] = [];
const SORT_OPTIONS: Array<{ value: CatalogSortOption; label: string }> = [
  { value: "recent", label: "Mas recientes" },
  { value: "oldest", label: "Mas antiguos" },
  { value: "name_asc", label: "Nombre A-Z" },
  { value: "name_desc", label: "Nombre Z-A" },
];

function readImageAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSize = 1280;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(String(reader.result));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };
      image.onerror = () => reject(new Error("No se pudo procesar la imagen"));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });
}

export default function NuevoViaje({
  navigationFunction,
  snack,
  viajeId,
}: Readonly<Props>) {
  const isEditing = Boolean(viajeId);
  const {
    rutas: rutasData,
    isError: rutasError,
    errorMessage: rutasErrorMessage,
    reload,
  } = useOperacionesData();
  const [isSaving, setIsSaving] = React.useState(false);

  const rutas = React.useMemo(() => rutasData.map(mapRutaApi), [rutasData]);
  const [routePageRoutes, setRoutePageRoutes] = React.useState<RutaBase[]>([]);
  const [selectedRouteIds, setSelectedRouteIds] = React.useState<number[]>([]);
  const [selectedRouteMap, setSelectedRouteMap] = React.useState<Map<number, RutaBase>>(
    () => new Map(),
  );
  const rutasById = React.useMemo(
    () => new Map([...rutas, ...routePageRoutes].map((ruta) => [ruta.id, ruta])),
    [routePageRoutes, rutas],
  );
  const selectedRouteKey = selectedRouteIds.join("|");
  const selectedRoutes = React.useMemo(
    () => {
      if (!selectedRouteKey) return EMPTY_ROUTES;
      return (
      selectedRouteIds
        .map((id) => selectedRouteMap.get(id) || rutasById.get(id))
        .filter((ruta): ruta is RutaBase => Boolean(ruta))
      );
    },
    [rutasById, selectedRouteKey, selectedRouteMap],
  );
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
          ? {
              ...connection,
              path: override.path,
              distanceMeters: override.distanceMeters,
            }
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

  const [nombreViaje, setNombreViaje] = React.useState("");
  const [descripcionViaje, setDescripcionViaje] = React.useState("");
  const [estatusViaje, setEstatusViaje] = React.useState(true);
  const [margenViajeMin, setMargenViajeMin] = React.useState(0);
  const [imagenViajeBase64, setImagenViajeBase64] = React.useState("");
  const [imagenViajePreview, setImagenViajePreview] = React.useState("");
  const [routeSearch, setRouteSearch] = React.useState("");
  const [routeSortOption, setRouteSortOption] =
    React.useState<CatalogSortOption>("recent");
  const [routePage, setRoutePage] = React.useState(1);
  const [routePageData, setRoutePageData] = React.useState({
    total: 0,
    totalPages: 1,
  });
  const [isLoadingRoutePage, setIsLoadingRoutePage] = React.useState(false);
  const [routeModalOpen, setRouteModalOpen] = React.useState(false);
  const [routePanelOpen, setRoutePanelOpen] = React.useState(true);
  const [routeRefreshKey, setRouteRefreshKey] = React.useState(0);

  const duracionCalculadaViajeMin = Math.round(metrics.durationMin);
  const duracionTotalViajeMin = duracionCalculadaViajeMin + margenViajeMin;
  const viajeImage = imagenViajePreview || DEFAULT_VIAJE_IMAGE;
  const storesImagesAsBase64 =
    (
      process.env.NEXT_PUBLIC_IMAGE_STORAGE_MODE ||
      (process.env.NODE_ENV === "production" ? "url" : "base64")
    ) === "base64";

  React.useEffect(() => {
    if (!isEditing || !viajeId) return;

    let cancelled = false;
    getViajeBase(viajeId)
      .then((response) => {
        if (cancelled) return;
        const viaje = mapViajeApi(response);
        setNombreViaje(viaje.nombre);
        setDescripcionViaje(viaje.descripcion || "");
        setEstatusViaje(viaje.estatus);
        setMargenViajeMin(viaje.margenMin || 0);
        const storedImageUrl = isGoogleStreetViewImage(viaje.imagenUrl)
          ? ""
          : viaje.imagenUrl || "";
        setImagenViajeBase64(viaje.imagenBase64 || "");
        setImagenViajePreview(viaje.imagenBase64 || storedImageUrl);
        setSelectedRouteIds(viaje.rutas.map((ruta) => ruta.id));
        setSelectedRouteMap(new Map(viaje.rutas.map((ruta) => [ruta.id, ruta])));
      })
      .catch((error) => {
        snack?.error({
          message:
            error instanceof Error
              ? `No se pudo cargar el viaje: ${error.message}`
              : "No se pudo cargar el viaje",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [isEditing, snack, viajeId]);

  React.useEffect(() => {
    const timeout = window.setTimeout(async () => {
      setIsLoadingRoutePage(true);
      try {
        const response = await getRutasPage({
          page: routePage,
          limit: 5,
          search: routeSearch,
          active: false,
          status: "active",
          sort: routeSortOption,
        });
        const mapped = response.data
          .map(mapRutaApi)
          .filter((ruta) => ruta.estatus !== false);
        setRoutePageRoutes(mapped);
        setRoutePageData({
          total: mapped.length,
          totalPages: mapped.length === 0 ? 1 : Math.max(1, response.totalPages),
        });
        setSelectedRouteMap((current) => {
          const next = new Map(current);
          mapped.forEach((ruta) => {
          if (selectedRouteIds.includes(ruta.id)) next.set(ruta.id, ruta);
          });
          return next;
        });
      } catch (error) {
        snack?.error({
          message:
            error instanceof Error
              ? `No se pudieron cargar rutas: ${error.message}`
              : "No se pudieron cargar rutas",
        });
      } finally {
        setIsLoadingRoutePage(false);
      }
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [
    routePage,
    routeRefreshKey,
    routeSearch,
    routeSortOption,
    selectedRouteKey,
    snack,
  ]);

  const toggleRoute = (routeId: number) => {
    const route = rutasById.get(routeId);
    setSelectedRouteIds((current) =>
      current.includes(routeId)
        ? current.filter((id) => id !== routeId)
        : [...current, routeId],
    );
    setSelectedRouteMap((current) => {
      const next = new Map(current);
      if (next.has(routeId)) next.delete(routeId);
      else if (route) next.set(routeId, route);
      return next;
    });
  };

  const saveViaje = async () => {
    if (!nombreViaje.trim() || selectedRouteIds.length === 0) {
      snack?.error({ message: "Necesitas nombre y al menos una ruta" });
      return;
    }
    try {
      setIsSaving(true);
      const body = {
        nombre: nombreViaje.trim(),
        descripcion: descripcionViaje.trim(),
        duracionCalculadaMin: duracionCalculadaViajeMin,
        margenMin: margenViajeMin,
        duracionTotalMin: duracionTotalViajeMin,
        imagenUrl:
          !storesImagesAsBase64 &&
          imagenViajePreview &&
          !imagenViajeBase64 &&
          !isGoogleStreetViewImage(imagenViajePreview)
            ? imagenViajePreview
            : undefined,
        imagenBase64:
          storesImagesAsBase64 && imagenViajeBase64
            ? imagenViajeBase64
            : undefined,
        imagenStorage:
          storesImagesAsBase64 && imagenViajeBase64
            ? "base64"
            : "default-asset",
        estatus: estatusViaje,
        rutas: selectedRouteIds.map((rutaId, index) => ({
          rutaId,
          orden: index + 1,
          conexion: mergedConnections.find((connection) => connection.toRouteId === rutaId)
            ?.path,
          distanciaConexionMetros: mergedConnections.find(
            (connection) => connection.toRouteId === rutaId,
          )?.distanceMeters,
        })),
      };
      if (isEditing && viajeId) await updateViajeBase(viajeId, body);
      else await createViajeBase(body);
      snack?.success({ message: isEditing ? "Viaje base actualizado" : "Viaje base creado" });
      navigationFunction("/dashboard/trips");
    } catch (error) {
      snack?.error({
        message:
          error instanceof Error
            ? `No se pudo guardar el viaje base: ${error.message}`
            : "No se pudo guardar el viaje base",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          { nombre: "Viajes", href: "/dashboard/trips" },
          {
            nombre: isEditing ? "Editar" : "Nuevo",
            href: isEditing
              ? `/dashboard/trips/editar/${viajeId}`
              : "/dashboard/trips/nuevo",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title={isEditing ? "Editar viaje base" : "Nuevo viaje base"}
        subtitle="Crea trayectos reutilizables y arma la composicion operativa del viaje"
        iconname={isEditing ? "edit" : "add"}
        showButton
        onButtonClick={() => navigationFunction("/dashboard/trips")}
        buttonTitle="Volver"
        leftIcon={<ChevronLeftIcon />}
      />

      {rutasError && (
        <Alert severity="error">
          {rutasErrorMessage ||
            "No se pudieron cargar rutas desde backend. Revisa operaciones-service y gateway."}
        </Alert>
      )}

      <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1fr) 360px" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              order: { xs: 2, xl: 2 },
              position: { xl: "sticky" },
              top: 16,
            }}
          >
            <PaperBlock
              title="Datos del viaje"
              contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <AssignmentIcon color="primary" fontSize="small" />
                <Typography variant="body1" sx={{ fontWeight: 950 }}>
                  Informacion principal
                </Typography>
              </Stack>
              <TextField
                label="Nombre del viaje base"
                value={nombreViaje}
                onChange={(event) => setNombreViaje(event.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label="Descripcion"
                value={descripcionViaje}
                onChange={(event) => setDescripcionViaje(event.target.value)}
                size="small"
                multiline
                rows={2}
                fullWidth
              />
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                  <TimerIcon color="primary" fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 850 }}>
                    Duracion operativa
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      gridColumn: "1 / -1",
                      p: 1.25,
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: "rgba(31, 97, 141, 0.20)",
                      color: "primary.main",
                      backgroundColor: "rgba(31, 97, 141, 0.08)",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Tiempo calculado por Google Directions
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 950, lineHeight: 1.1 }}>
                      {duracionCalculadaViajeMin} min
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "8px",
                      backgroundColor: "background.paper",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Margen adicional
                    </Typography>
                    <TextField
                      type="number"
                      value={margenViajeMin}
                      onChange={(event) =>
                        setMargenViajeMin(Math.max(0, Number(event.target.value) || 0))
                      }
                      size="small"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <Typography variant="caption" color="text.secondary">
                              min
                            </Typography>
                          ),
                        },
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      p: 1,
                      border: "1px solid",
                      borderColor: "primary.main",
                      borderRadius: "8px",
                      color: "white",
                      background:
                        "linear-gradient(135deg, rgba(31,97,141,0.96), rgba(25,56,92,0.94))",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
                      Total del viaje
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 950, color: "white", lineHeight: 1.15 }}
                    >
                      {duracionTotalViajeMin} min
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              <Stack spacing={1}>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                  <ImageIcon color="primary" fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 850 }}>
                    Imagen del viaje
                  </Typography>
                </Stack>
                <Box
                  component="img"
                  src={viajeImage}
                  alt="Imagen del viaje"
                  sx={{
                    width: "100%",
                    height: 118,
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />
                {!imagenViajePreview && (
                  <Alert severity="info">
                    Si no subes imagen, se guardara la imagen institucional por defecto.
                  </Alert>
                )}
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<AddPhotoAlternateIcon />}
                >
                  Cambiar imagen
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      try {
                        const base64 = await readImageAsBase64(file);
                        setImagenViajeBase64(base64);
                        setImagenViajePreview(base64);
                      } catch (error) {
                        snack?.error({
                          message:
                            error instanceof Error
                              ? error.message
                              : "No se pudo cargar la imagen",
                        });
                      }
                    }}
                  />
                </Button>
              </Stack>
              <Divider />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<ChevronLeftIcon />}
                  onClick={() => navigationFunction("/dashboard/trips")}
                  disabled={isSaving}
                  sx={{ flex: 1 }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<SaveIcon />}
                  onClick={saveViaje}
                  disabled={isSaving}
                  sx={{
                    flex: 1.4,
                    fontWeight: 950,
                    boxShadow: "0 12px 24px rgba(31, 45, 94, 0.22)",
                  }}
                >
                  Guardar viaje
                </Button>
              </Stack>
            </PaperBlock>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, order: { xs: 1, xl: 1 } }}>
            <PaperBlock
              title="Vista previa del viaje"
              subtitle="El orden sale de tu seleccion. Si dos rutas no conectan, se dibuja un enlace operativo punteado."
              paperProps={{ sx: { p: 2, overflow: "hidden" } }}
              contentWrapperSx={{ p: 0 }}
            >
              {selectedRoutes.length === 0 && (
                <Alert severity="info" sx={{ m: 1.25, mb: 0 }}>
                  Abre el control Rutas del mapa y selecciona una o mas rutas para armar el viaje base.
                </Alert>
              )}
              <Box sx={{ position: "relative" }}>
                <GoogleRouteMap
                  routes={selectedRoutes}
                  connections={mergedConnections}
                  height="calc(100vh - 270px)"
                  title={
                    mergedConnections.length === 0
                      ? "Viaje conectado"
                      : "Viaje con enlaces pendientes"
                  }
                  enableStreetView
                  enableSimulation={journeySimulationPath.length > 1}
                  simulationPath={journeySimulationPath}
                  editableConnections
                  onConnectionPathChange={updateConnectionPath}
                  infoContent={
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
                        <Typography variant="overline" sx={{ letterSpacing: 0, opacity: 0.72 }}>
                          Resumen del viaje
                        </Typography>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 950 }}>
                              {selectedRoutes.length}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
                              Rutas
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 950 }}>
                              {metrics.distanceKm.toFixed(1)} km
                            </Typography>
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
                              Distancia
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 950 }}>
                              {duracionCalculadaViajeMin} min
                            </Typography>
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
                              Calculado
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 950 }}>
                              {duracionTotalViajeMin} min
                            </Typography>
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
                              Total
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Stack spacing={1}>
                        {selectedRoutes.map((ruta, index) => {
                          const previousConnection = mergedConnections.find(
                            (connection) => connection.toRouteId === ruta.id,
                          );
                          return (
                            <Box key={ruta.id}>
                              {previousConnection && (
                                <Alert severity="warning" sx={{ mb: 1 }}>
                                  Enlace antes de ruta {index + 1}: traslado sin pasajeros hasta el siguiente inicio.
                                </Alert>
                              )}
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: "8px",
                                  border: "1px solid",
                                  borderColor: "divider",
                                }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 900 }}>
                                  {index + 1}. {ruta.nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {ruta.origen.nombre} -&gt; {ruta.destino.nombre}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                      {mergedConnections.length > 0 && (
                        <Alert severity="warning">
                          Hay rutas que no conectan directamente; el tramo punteado indica el enlace operativo.
                        </Alert>
                      )}
                    </Stack>
                  }
                />
                <Stack sx={{ position: "absolute", left: 16, top: 16, zIndex: 5 }}>
                  <Button
                    variant="contained"
                    startIcon={<RouteIcon />}
                    onClick={() => setRoutePanelOpen((current) => !current)}
                    sx={{
                      borderRadius: "999px",
                      fontWeight: 900,
                      boxShadow: "0 14px 28px rgba(15,23,42,0.22)",
                    }}
                  >
                    Rutas
                  </Button>
                </Stack>
                {routePanelOpen && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: 16,
                      top: 68,
                      zIndex: 5,
                      width: { xs: 310, sm: 390 },
                      maxHeight: "calc(100% - 92px)",
                      overflow: "auto",
                      p: 1.25,
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: "rgba(15,23,42,0.12)",
                      backgroundColor: "rgba(255,255,255,0.98)",
                      boxShadow: "0 18px 36px rgba(15,23,42,0.20)",
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 950 }}>
                          Rutas del viaje
                        </Typography>
                        <IconButton size="small" onClick={() => setRoutePanelOpen(false)}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setRouteModalOpen(true)}
                        sx={{ fontWeight: 900 }}
                      >
                        Crear ruta
                      </Button>
                      <Stack spacing={0.55}>
                        <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, fontWeight: 800 }}>
                          Buscar
                        </Typography>
                        <TextField
                          placeholder="Buscar ruta"
                          value={routeSearch}
                          onChange={(event) => {
                            setRouteSearch(event.target.value);
                            setRoutePage(1);
                          }}
                          size="small"
                          fullWidth
                        />
                      </Stack>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr",
                          gap: 1,
                        }}
                      >
                        <Stack spacing={0.55}>
                          <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, fontWeight: 800 }}>
                            Ordenar
                          </Typography>
                          <TextField
                            select
                            value={routeSortOption}
                            onChange={(event) => {
                              setRouteSortOption(event.target.value as CatalogSortOption);
                              setRoutePage(1);
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
                        {isLoadingRoutePage
                          ? "Buscando rutas..."
                          : `${routePageData.total} ruta(s) encontradas`}
                      </Typography>
                      {routePageRoutes.length === 0 ? (
                        <Alert severity="info">
                          No hay rutas para esta busqueda.
                        </Alert>
                      ) : (
                        routePageRoutes.map((ruta) => (
                          <Box
                            key={ruta.id}
                            sx={{
                              p: 1,
                              borderRadius: "8px",
                              border: "1px solid",
                              borderColor: selectedRouteIds.includes(ruta.id)
                                ? ruta.color
                                : "divider",
                              backgroundColor: selectedRouteIds.includes(ruta.id)
                                ? "rgba(31, 97, 141, 0.06)"
                                : "background.paper",
                            }}
                          >
                            <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                              <Checkbox
                                checked={selectedRouteIds.includes(ruta.id)}
                                onChange={() => toggleRoute(ruta.id)}
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 900 }} noWrap>
                                  {ruta.nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {ruta.origen.direccion} a {ruta.destino.direccion}
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 0.75 }}>
                                  {selectedRouteIds.includes(ruta.id) && (
                                    <Chip
                                      label={`R${selectedRouteIds.indexOf(ruta.id) + 1}`}
                                      color="primary"
                                      size="small"
                                    />
                                  )}
                                  <Chip label={`${ruta.distanciaKm || "-"} km`} size="small" />
                                  <Chip label={`${ruta.duracionMin || "-"} min`} size="small" />
                                  <Chip label={`${ruta.paradas.length} parada(s)`} size="small" />
                                </Stack>
                              </Box>
                            </Stack>
                          </Box>
                        ))
                      )}
                      <Pagination
                        count={Math.max(1, routePageData.totalPages)}
                        page={Math.min(routePage, Math.max(1, routePageData.totalPages))}
                        onChange={(_, page) => setRoutePage(page)}
                        color="primary"
                        size="small"
                        sx={{ alignSelf: "center" }}
                      />
                    </Stack>
                  </Box>
                )}
              </Box>
            </PaperBlock>
          </Box>
        </Box>
      <Dialog
        open={routeModalOpen}
        onClose={() => setRouteModalOpen(false)}
        fullWidth
        maxWidth="xl"
        slotProps={{
          paper: {
            sx: {
              height: "calc(100vh - 48px)",
              borderRadius: "8px",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 950 }}>
              Crear ruta reutilizable
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Define origen, destino, paradas y trazo operativo.
            </Typography>
          </Box>
          <IconButton onClick={() => setRouteModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2, overflow: "auto" }}>
          <RutaDesigner
            snack={snack}
            onSaved={async () => {
              await reload();
              setRouteRefreshKey((current) => current + 1);
              setRoutePage(1);
              setRouteModalOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
