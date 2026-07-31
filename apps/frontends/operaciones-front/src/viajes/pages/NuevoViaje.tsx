"use client";

import React from "react";
import {
  Breadcrumb,
  CommonPageProps,
  PaperBlock,
  PaperHeader,
} from "@nexoroute/commons";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  Pagination,
} from "@mui/material";
import GoogleRouteMap, {
  PlaceSuggestion,
  RouteMetrics,
  getPlaceDetails,
  geocodeAddress,
  searchPlacePredictions,
} from "../components/GoogleRouteMap";
import RutaDesigner from "../components/RutaDesigner";
import {
  createRuta,
  createViajeBase,
  getViajeBase,
  getRutasPage,
  updateViajeBase,
  useOperacionesData,
} from "../api/operacionesHttp";
import GeoPoint from "../types/GeoPoint";
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

type MapPointAction = {
  replaceClientId?: string;
};

const DEFAULT_VIAJE_IMAGE = "/imagen_defecto_viajes.jpg";
const EMPTY_ROUTES: RutaBase[] = [];
const EMPTY_MARKERS: Array<GeoPoint & { markerRole?: "origen" | "destino" | "parada" }> = [];

function routeDraftFromPoints(
  nombre: string,
  descripcion: string,
  origen: GeoPoint | null,
  destino: GeoPoint | null,
  paradas: GeoPoint[],
  metrics?: RouteMetrics,
): RutaBase | null {
  if (!origen || !destino) return null;
  const stopSeconds = paradas.reduce(
    (total, parada) => total + (parada.tiempoParadaMin || 0) * 60,
    0,
  );
  const totalSeconds = (metrics?.duracionSegundos || 0) + stopSeconds;

  return {
    id: -1,
    nombre: nombre || "Ruta en diseno",
    descripcion,
    origen,
    destino,
    paradas,
    distanciaKm: metrics?.distanciaMetros
      ? Number((metrics.distanciaMetros / 1000).toFixed(1))
      : 0,
    duracionMin: totalSeconds
      ? Math.max(1, Math.round(totalSeconds / 60))
      : 0,
    color: "#1f618d",
    estatus: true,
  };
}

function cleanPoint(point: GeoPoint): GeoPoint {
  const { clientId, isResolving, ...clean } = point;
  return clean;
}

function readImageAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
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
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [tab, setTab] = React.useState(0);
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
  const [margenViajeMin, setMargenViajeMin] = React.useState(0);
  const [imagenViajeBase64, setImagenViajeBase64] = React.useState("");
  const [imagenViajePreview, setImagenViajePreview] = React.useState("");
  const [routeSearch, setRouteSearch] = React.useState("");
  const [routePage, setRoutePage] = React.useState(1);
  const [routePageData, setRoutePageData] = React.useState({
    total: 0,
    totalPages: 1,
  });
  const [isLoadingRoutePage, setIsLoadingRoutePage] = React.useState(false);

  const [nombreRuta, setNombreRuta] = React.useState("");
  const [descripcionRuta, setDescripcionRuta] = React.useState("");
  const [origenInput, setOrigenInput] = React.useState("");
  const [destinoInput, setDestinoInput] = React.useState("");
  const [origenOptions, setOrigenOptions] = React.useState<PlaceSuggestion[]>([]);
  const [destinoOptions, setDestinoOptions] = React.useState<PlaceSuggestion[]>([]);
  const [placesLoading, setPlacesLoading] = React.useState<"origen" | "destino" | null>(null);
  const [origen, setOrigen] = React.useState<GeoPoint | null>(null);
  const [destino, setDestino] = React.useState<GeoPoint | null>(null);
  const [paradas, setParadas] = React.useState<GeoPoint[]>([]);
  const [target, setTarget] = React.useState<"origen" | "destino" | "parada">("origen");
  const [routeMetrics, setRouteMetrics] = React.useState<RouteMetrics | undefined>();
  const [routeMissingFields, setRouteMissingFields] = React.useState<string[]>([]);
  const setStableRouteMetrics = React.useCallback((nextMetrics: RouteMetrics) => {
    setRouteMetrics((current) => {
      if (
        current?.distanciaMetros === nextMetrics.distanciaMetros &&
        current?.duracionSegundos === nextMetrics.duracionSegundos &&
        current?.overviewPath.length === nextMetrics.overviewPath.length
      ) {
        return current;
      }
      return nextMetrics;
    });
  }, []);

  const draftRoute = React.useMemo(
    () =>
      routeDraftFromPoints(
        nombreRuta,
        descripcionRuta,
        origen,
        destino,
        paradas,
        routeMetrics,
      ),
    [descripcionRuta, destino, nombreRuta, origen, paradas, routeMetrics],
  );

  const mapDraftRoute = React.useMemo(
    () => routeDraftFromPoints(nombreRuta, descripcionRuta, origen, destino, paradas),
    [descripcionRuta, destino, nombreRuta, origen, paradas],
  );
  const draftMapRoutes = React.useMemo(
    () => (mapDraftRoute ? [mapDraftRoute] : EMPTY_ROUTES),
    [mapDraftRoute],
  );
  const draftMarkers = React.useMemo(
    () => [
      ...(origen ? [{ ...origen, markerRole: "origen" as const }] : []),
      ...(destino ? [{ ...destino, markerRole: "destino" as const }] : []),
      ...paradas.map((parada) => ({
        ...parada,
        markerRole: "parada" as const,
      })),
    ],
    [destino, origen, paradas],
  );
  const draftMapMarkers = mapDraftRoute ? EMPTY_MARKERS : draftMarkers;

  const duracionCalculadaViajeMin = Math.round(metrics.durationMin);
  const duracionTotalViajeMin = duracionCalculadaViajeMin + margenViajeMin;
  const viajeImage = imagenViajePreview || DEFAULT_VIAJE_IMAGE;
  const storesImagesAsBase64 =
    (process.env.NEXT_PUBLIC_IMAGE_STORAGE_MODE || "base64") === "base64";

  React.useEffect(() => {
    if (!isEditing || !viajeId) return;

    let cancelled = false;
    getViajeBase(viajeId)
      .then((response) => {
        if (cancelled) return;
        const viaje = mapViajeApi(response);
        setNombreViaje(viaje.nombre);
        setDescripcionViaje(viaje.descripcion || "");
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
    if (!apiKey || origenInput.trim().length < 3) {
      setOrigenOptions([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setPlacesLoading("origen");
      try {
        setOrigenOptions(await searchPlacePredictions(origenInput, apiKey));
      } finally {
        setPlacesLoading((current) => (current === "origen" ? null : current));
      }
    }, 280);

    return () => window.clearTimeout(timeout);
  }, [apiKey, origenInput]);

  React.useEffect(() => {
    if (!apiKey || destinoInput.trim().length < 3) {
      setDestinoOptions([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setPlacesLoading("destino");
      try {
        setDestinoOptions(await searchPlacePredictions(destinoInput, apiKey));
      } finally {
        setPlacesLoading((current) => (current === "destino" ? null : current));
      }
    }, 280);

    return () => window.clearTimeout(timeout);
  }, [apiKey, destinoInput]);

  React.useEffect(() => {
    const timeout = window.setTimeout(async () => {
      setIsLoadingRoutePage(true);
      try {
        const response = await getRutasPage({
          page: routePage,
          limit: 5,
          search: routeSearch,
          active: false,
        });
        const mapped = response.data.map(mapRutaApi);
        setRoutePageRoutes(mapped);
        setRoutePageData({
          total: response.total,
          totalPages: response.totalPages,
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
  }, [routePage, routeSearch, selectedRouteKey, snack]);

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

  const searchPoint = async (kind: "origen" | "destino") => {
    const address = kind === "origen" ? origenInput : destinoInput;
    if (!address.trim()) return;

    try {
      const point = await geocodeAddress(address, apiKey);
      if (kind === "origen") setOrigen({ ...point, nombre: "Origen" });
      else setDestino({ ...point, nombre: "Destino" });
      setRouteMissingFields((current) => current.filter((field) => field !== kind));
    } catch {
      snack?.error({ message: "No se encontro esa direccion en Google Maps" });
    }
  };

  const selectPlace = async (
    kind: "origen" | "destino",
    option: PlaceSuggestion | string | null,
  ) => {
    if (!option || typeof option === "string") return;

    try {
      const point = await getPlaceDetails(option.placeId, apiKey);
      if (kind === "origen") {
        setOrigen({ ...point, nombre: "Origen" });
        setOrigenInput(option.description);
      } else {
        setDestino({ ...point, nombre: "Destino" });
        setDestinoInput(option.description);
      }
      setRouteMissingFields((current) => current.filter((field) => field !== kind));
    } catch {
      snack?.error({ message: "No se pudo cargar ese lugar de Google Maps" });
    }
  };

  const resetRouteForm = React.useCallback(() => {
    setNombreRuta("");
    setDescripcionRuta("");
    setOrigenInput("");
    setDestinoInput("");
    setOrigenOptions([]);
    setDestinoOptions([]);
    setOrigen(null);
    setDestino(null);
    setParadas([]);
    setRouteMetrics(undefined);
    setRouteMissingFields([]);
    setTarget("origen");
  }, []);

  const applyMapPoint = React.useCallback((
    point: GeoPoint,
    kind: "origen" | "destino" | "parada",
    action?: MapPointAction,
  ) => {
    if (kind === "origen") {
      setOrigen({ ...point, nombre: point.isResolving ? "Origen marcado" : "Origen" });
      setOrigenInput(point.direccion);
      setRouteMissingFields((current) => current.filter((field) => field !== "origen"));
    }
    if (kind === "destino") {
      setDestino({ ...point, nombre: point.isResolving ? "Destino marcado" : "Destino" });
      setDestinoInput(point.direccion);
      setRouteMissingFields((current) => current.filter((field) => field !== "destino"));
    }
    if (kind === "parada") {
      setParadas((current) => {
        if (action?.replaceClientId) {
          return current.map((item) =>
            item.clientId === action.replaceClientId
              ? {
                  ...point,
                  nombre: point.nombre || item.nombre,
                }
              : item,
          );
        }

        return [
          ...current,
          {
            ...point,
            nombre: point.nombre || `Parada ${current.length + 1}`,
            tiempoParadaMin: point.tiempoParadaMin ?? 5,
          },
        ];
      });
    }
  }, []);

  const saveRoute = async () => {
    const missing = [
      ...(!nombreRuta.trim() ? ["nombre"] : []),
      ...(!origen ? ["origen"] : []),
      ...(!destino ? ["destino"] : []),
    ];

    if (missing.length > 0) {
      setRouteMissingFields(missing);
      snack?.error({ message: "Completa los campos obligatorios de la ruta" });
      return;
    }
    if (!origen || !destino) return;

    try {
      setIsSaving(true);
      await createRuta({
        nombre: nombreRuta.trim(),
        descripcion: descripcionRuta.trim(),
        origen: cleanPoint(origen),
        destino: cleanPoint(destino),
        paradas: paradas.map(cleanPoint),
        waypoints: routeMetrics?.overviewPath,
        distanciaMetros: routeMetrics?.distanciaMetros,
        duracionSegundos:
          (routeMetrics?.duracionSegundos || 0) +
          paradas.reduce(
            (total, parada) => total + (parada.tiempoParadaMin || 0) * 60,
            0,
          ),
        estatus: true,
      });
      snack?.success({ message: "Ruta guardada" });
      await reload();
      resetRouteForm();
      setTab(0);
    } catch (error) {
      snack?.error({
        message:
          error instanceof Error
            ? `No se pudo guardar la ruta: ${error.message}`
            : "No se pudo guardar la ruta",
      });
    } finally {
      setIsSaving(false);
    }
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
        estatus: true,
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

      <PaperBlock paperProps={{ sx: { p: 0 } }} contentWrapperSx={{ p: 0 }}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{ px: 2, borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Tab label="Armar viaje base" />
          <Tab label="Crear ruta reutilizable" />
        </Tabs>
      </PaperBlock>

      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "8px",
          backgroundColor: "rgba(255,255,255,0.96)",
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {tab === 0
            ? "Guarda la plantilla cuando tenga nombre y rutas seleccionadas."
            : "El diseno de rutas usa el mismo componente del modulo Rutas."}
        </Typography>
        {tab === 0 && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ChevronLeftIcon />}
              onClick={() => navigationFunction("/dashboard/trips")}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={saveViaje}
              disabled={isSaving}
            >
              Guardar viaje base
            </Button>
          </Stack>
        )}
      </Box>

      {tab === 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "360px minmax(0, 1fr) 380px" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              position: { xl: "sticky" },
              top: 16,
            }}
          >
            <PaperBlock
              title="1. Datos del viaje"
              contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
            >
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
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Duracion operativa
                </Typography>
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 118px",
                      alignItems: "center",
                      gap: 1,
                      px: 1.25,
                      py: 0.9,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Tiempo calculado por Google Directions
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: "right", fontWeight: 900 }}>
                      {duracionCalculadaViajeMin} min
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 118px",
                      alignItems: "center",
                      gap: 1,
                      px: 1.25,
                      py: 0.9,
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
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
                      display: "grid",
                      gridTemplateColumns: "1fr 118px",
                      alignItems: "center",
                      gap: 1,
                      px: 1.25,
                      py: 0.9,
                      borderTop: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "rgba(31, 97, 141, 0.08)",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 900 }}>
                      Total del viaje
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ textAlign: "right", fontWeight: 900, color: "primary.main" }}
                    >
                      {duracionTotalViajeMin} min
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Google Directions calcula el recorrido; las paradas agregan sus minutos de espera. El margen solo permite agregar tiempo.
                </Typography>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Imagen del viaje
                </Typography>
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
            </PaperBlock>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <PaperBlock
              title="Vista previa del viaje"
              subtitle="El orden sale de tu seleccion. Si dos rutas no conectan, se dibuja un enlace operativo punteado."
              paperProps={{ sx: { p: 0, overflow: "hidden" } }}
              contentWrapperSx={{ p: 0 }}
            >
              <GoogleRouteMap
                routes={selectedRoutes}
                connections={mergedConnections}
                height={560}
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
              />
            </PaperBlock>
            <PaperBlock
              title="Resumen antes de guardar"
              subtitle="La duracion incluye tiempos de ruta, espera en paradas y margen adicional"
              contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1 }}
            >
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                <Chip label={`${selectedRoutes.length} ruta(s)`} color="primary" />
                <Chip label={`${metrics.distanceKm.toFixed(1)} km`} />
                <Chip label={`${duracionCalculadaViajeMin} min calculados`} />
                <Chip label={`${duracionTotalViajeMin} min totales`} color="secondary" />
                <Chip label={mergedConnections.length ? `${mergedConnections.length} enlace(s)` : "Sin enlaces"} />
              </Stack>
              {selectedRoutes.length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                    Secuencia operativa
                  </Typography>
                  {selectedRoutes.map((ruta, index) => {
                    const previousConnection = mergedConnections.find(
                      (connection) => connection.toRouteId === ruta.id,
                    );
                    return (
                      <Box key={ruta.id}>
                        {previousConnection && (
                          <Alert severity="warning" sx={{ mb: 1 }}>
                            Enlace antes de ruta {index + 1}: el autobus viaja sin pasajeros desde el fin de la ruta anterior hasta el inicio de esta.
                          </Alert>
                        )}
                        <Box
                          sx={{
                            p: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: "8px",
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
                </Box>
              )}
              {mergedConnections.length > 0 && (
                <Alert severity="warning">
                  Hay rutas que no empiezan donde termina la anterior. Si dos recorridos comparten calles, se siguen pintando ambos; lo que manda para el viaje es este orden operativo.
                </Alert>
              )}
            </PaperBlock>
          </Box>

          <PaperBlock
            title="2. Rutas del viaje"
            subtitle="Selecciona el orden operativo"
            contentMaxHeight={720}
            paperProps={{
              sx: {
                position: { xl: "sticky" },
                top: 16,
              },
            }}
            contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            <TextField
              label="Buscar ruta"
              value={routeSearch}
              onChange={(event) => {
                setRouteSearch(event.target.value);
                setRoutePage(1);
              }}
              size="small"
              fullWidth
            />
            <Typography variant="caption" color="text.secondary">
              {isLoadingRoutePage
                ? "Buscando rutas..."
                : `${routePageData.total} ruta(s) encontradas`}
            </Typography>
            {routePageRoutes.length === 0 ? (
              <Alert severity="info">
                No hay rutas para esta busqueda. Crea una ruta reutilizable en la segunda pestana.
              </Alert>
            ) : (
              routePageRoutes.map((ruta) => (
                <Box
                  key={ruta.id}
                  sx={{
                    p: 1.25,
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
                      <Typography sx={{ fontWeight: 900 }}>{ruta.nombre}</Typography>
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
            {routePageData.totalPages > 1 && (
              <Pagination
                count={routePageData.totalPages}
                page={routePage}
                onChange={(_, page) => setRoutePage(page)}
                color="primary"
                size="small"
              />
            )}
          </PaperBlock>
        </Box>
      )}

      {tab === 1 && (
        <RutaDesigner
          snack={snack}
          onSaved={async () => {
            await reload();
            setTab(0);
          }}
        />
      )}

      {false && tab === 1 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "430px minmax(0, 1fr)" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <PaperBlock
              title="1. Buscar o marcar puntos"
              subtitle="Puedes buscar direccion o elegir el modo y hacer clic directamente en el mapa"
              contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.25 }}
            >
              <TextField
                label="Nombre de la ruta"
                value={nombreRuta}
                onChange={(event) => {
                  setNombreRuta(event.target.value);
                  if (event.target.value.trim()) {
                    setRouteMissingFields((current) =>
                      current.filter((field) => field !== "nombre"),
                    );
                  }
                }}
                size="small"
                fullWidth
                required
                error={routeMissingFields.includes("nombre")}
                helperText={
                  routeMissingFields.includes("nombre")
                    ? "El nombre de la ruta es obligatorio"
                    : ""
                }
              />
              <TextField
                label="Descripcion"
                value={descripcionRuta}
                onChange={(event) => setDescripcionRuta(event.target.value)}
                size="small"
                multiline
                rows={2}
                fullWidth
              />

              <Stack direction="row" spacing={1}>
                <Autocomplete
                  freeSolo
                  options={origenOptions}
                  loading={placesLoading === "origen"}
                  loadingText="Buscando lugares..."
                  noOptionsText={
                    origenInput.trim().length < 3
                      ? "Escribe al menos 3 letras"
                      : "Sin resultados"
                  }
                  filterOptions={(options) => options}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.description
                  }
                  onChange={(_, option) => selectPlace("origen", option)}
                  inputValue={origenInput}
                  onInputChange={(_, value) => setOrigenInput(value)}
                  onFocus={() => setTarget("origen")}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {option.mainText}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.secondaryText}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Origen"
                      size="small"
                      fullWidth
                      required
                      error={routeMissingFields.includes("origen")}
                      helperText={
                        routeMissingFields.includes("origen")
                          ? "Busca o marca el origen en el mapa"
                          : "Al enfocar este campo, el clic del mapa asigna origen"
                      }
                    />
                  )}
                  sx={{ flex: 1 }}
                />
                <Tooltip title="Buscar origen">
                  <IconButton onClick={() => {
                    setTarget("origen");
                    searchPoint("origen");
                  }}>
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Autocomplete
                  freeSolo
                  options={destinoOptions}
                  loading={placesLoading === "destino"}
                  loadingText="Buscando lugares..."
                  noOptionsText={
                    destinoInput.trim().length < 3
                      ? "Escribe al menos 3 letras"
                      : "Sin resultados"
                  }
                  filterOptions={(options) => options}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.description
                  }
                  onChange={(_, option) => selectPlace("destino", option)}
                  inputValue={destinoInput}
                  onInputChange={(_, value) => setDestinoInput(value)}
                  onFocus={() => setTarget("destino")}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {option.mainText}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.secondaryText}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Destino"
                      size="small"
                      fullWidth
                      required
                      error={routeMissingFields.includes("destino")}
                      helperText={
                        routeMissingFields.includes("destino")
                          ? "Busca o marca el destino en el mapa"
                          : "Al enfocar este campo, el clic del mapa asigna destino"
                      }
                    />
                  )}
                  sx={{ flex: 1 }}
                />
                <Tooltip title="Buscar destino">
                  <IconButton onClick={() => {
                    setTarget("destino");
                    searchPoint("destino");
                  }}>
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
              </Stack>

              <ToggleButtonGroup
                exclusive
                size="small"
                value={target}
                onChange={(_, value) => value && setTarget(value)}
                fullWidth
              >
                <ToggleButton value="origen">
                  <MyLocationIcon fontSize="small" />
                  Origen
                </ToggleButton>
                <ToggleButton value="destino">Destino</ToggleButton>
                <ToggleButton value="parada">
                  <AddLocationAltIcon fontSize="small" />
                  Parada
                </ToggleButton>
              </ToggleButtonGroup>
            </PaperBlock>

            <PaperBlock
              title="2. Paradas"
              subtitle="Activa Nueva parada y haz clic en el mapa. Cada parada guarda minutos de espera."
              contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1 }}
            >
              <Button
                variant={target === "parada" ? "contained" : "outlined"}
                startIcon={<AddLocationAltIcon />}
                onClick={() => setTarget("parada")}
              >
                Nueva parada
              </Button>
              {paradas.length === 0 ? (
                <Alert severity="info">Aun no agregas paradas.</Alert>
              ) : (
                paradas.map((point, index) => (
                  <Box
                    key={`${point.lat}-${point.lng}-${index}`}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "32px minmax(0, 1fr) 120px auto",
                      gap: 1,
                      alignItems: "center",
                      p: 1,
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Chip label={index + 1} size="small" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {point.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {point.direccion}
                      </Typography>
                      {point.isResolving && (
                        <Chip
                          label="Resolviendo direccion"
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{ mt: 0.75 }}
                        />
                      )}
                    </Box>
                    <TextField
                      label="Min"
                      type="number"
                      size="small"
                      value={point.tiempoParadaMin ?? 5}
                      onChange={(event) => {
                        const value = Math.max(0, Number(event.target.value) || 0);
                        setParadas((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, tiempoParadaMin: value }
                              : item,
                          ),
                        );
                      }}
                      slotProps={{
                        input: {
                          startAdornment: <AccessTimeIcon fontSize="small" />,
                        },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() =>
                        setParadas((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))
              )}
            </PaperBlock>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <PaperBlock
              title="Mapa de diseno"
              subtitle="El trazo se calcula con Google Directions. Puedes arrastrar el camino para ajustar por donde pasa."
              paperProps={{ sx: { p: 0, overflow: "hidden" } }}
              contentWrapperSx={{ p: 0 }}
            >
              <GoogleRouteMap
                routes={draftMapRoutes}
                markerPoints={draftMapMarkers}
                height={660}
                title="Ruta reutilizable en construccion"
                editable
                editingTarget={target}
                onMapPoint={applyMapPoint}
                onRouteMetrics={setStableRouteMetrics}
                enableStreetView
              />
            </PaperBlock>
            <PaperBlock
              title="Datos calculados"
              subtitle="Estos valores se mandan al backend al guardar la ruta"
              contentWrapperSx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
            >
              <Chip label={`${draftRoute?.distanciaKm || "-"} km`} color="primary" />
              <Chip label={`${draftRoute?.duracionMin || "-"} min`} />
              <Chip label={`${paradas.length} parada(s)`} />
              <Chip label={apiKey ? "Google Maps activo" : "Falta API key"} />
            </PaperBlock>
          </Box>
        </Box>
      )}

    </>
  );
}
