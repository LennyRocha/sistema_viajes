"use client";

import React from "react";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import FlagIcon from "@mui/icons-material/Flag";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import RouteIcon from "@mui/icons-material/Route";
import TimerIcon from "@mui/icons-material/Timer";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PaperBlock } from "@nexoroute/commons";
import GoogleRouteMap, {
  PlaceSuggestion,
  RouteMetrics,
  getPlaceDetails,
  searchPlacePredictions,
} from "./GoogleRouteMap";
import { createRuta } from "../api/operacionesHttp";
import GeoPoint from "../types/GeoPoint";
import RutaBase from "../types/RutaBase";

type MapPointAction = {
  replaceClientId?: string;
};

type Props = {
  onSaved?: () => Promise<void> | void;
  snack?: {
    success?: (args: { message: string }) => void;
    error?: (args: { message: string }) => void;
  };
};

const EMPTY_ROUTES: RutaBase[] = [];
const EMPTY_MARKERS: Array<GeoPoint & { markerRole?: "origen" | "destino" | "parada" }> = [];
const DEFAULT_STOP_MINUTES = 5;

function cleanPoint(point: GeoPoint): GeoPoint {
  const { clientId, isResolving, ...clean } = point;
  return clean;
}

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
    (total, parada) => total + (parada.tiempoParadaMin ?? DEFAULT_STOP_MINUTES) * 60,
    0,
  );
  const totalSeconds = (metrics?.duracionSegundos || 0) + stopSeconds;

  return {
    id: -1,
    nombre: nombre || "Ruta en preparacion",
    descripcion,
    origen,
    destino,
    paradas,
    waypoints: metrics?.overviewPath,
    distanciaKm: metrics?.distanciaMetros
      ? Number((metrics.distanciaMetros / 1000).toFixed(1))
      : 0,
    duracionMin: totalSeconds ? Math.max(1, Math.round(totalSeconds / 60)) : 0,
    color: "#1f618d",
    estatus: true,
  };
}

export default function RutaDesigner({ onSaved, snack }: Readonly<Props>) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [isSaving, setIsSaving] = React.useState(false);
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
  const [activePanel, setActivePanel] = React.useState<"origen" | "destino" | "parada" | null>("origen");
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
      snack?.error?.({ message: "No se pudo cargar ese lugar de Google Maps" });
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
    setActivePanel("origen");
  }, []);

  const openMapPanel = React.useCallback((nextTarget: "origen" | "destino" | "parada") => {
    setTarget(nextTarget);
    setActivePanel(nextTarget);
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
              ? { ...point, nombre: point.nombre || item.nombre }
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
      if (missing.includes("origen")) openMapPanel("origen");
      else if (missing.includes("destino")) openMapPanel("destino");
      snack?.error?.({ message: "Completa los campos obligatorios de la ruta" });
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
            (total, parada) =>
              total + (parada.tiempoParadaMin ?? DEFAULT_STOP_MINUTES) * 60,
            0,
          ),
        estatus: true,
      });
      snack?.success?.({ message: "Ruta guardada" });
      resetRouteForm();
      await onSaved?.();
    } catch (error) {
      snack?.error?.({
        message:
          error instanceof Error
            ? `No se pudo guardar la ruta: ${error.message}`
            : "No se pudo guardar la ruta",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isResolvingPoint =
    Boolean(origen?.isResolving) ||
    Boolean(destino?.isResolving) ||
    paradas.some((parada) => parada.isResolving);
  const routeDriveMin = routeMetrics?.duracionSegundos
    ? Math.max(1, Math.round(routeMetrics.duracionSegundos / 60))
    : 0;
  const stopMinutes = paradas.reduce(
    (total, parada) => total + (parada.tiempoParadaMin ?? DEFAULT_STOP_MINUTES),
    0,
  );

  const pointSummary = (label: string, point: GeoPoint | null, color: string) => (
    <Box
      sx={{
        p: 1,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: point ? "success.main" : "divider",
        backgroundColor: point ? "rgba(46, 125, 50, 0.08)" : "background.paper",
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Chip
          label={label}
          size="small"
          sx={{
            backgroundColor: point ? "success.main" : color,
            color: "white",
            fontWeight: 900,
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 900 }} noWrap>
            {point?.nombre || "Sin seleccionar"}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {point?.direccion || "Usa el panel del mapa"}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );

  const placePanel = (kind: "origen" | "destino") => {
    const isOrigen = kind === "origen";
    const selectedPoint = isOrigen ? origen : destino;
    const inputValue = isOrigen ? origenInput : destinoInput;
    const options = isOrigen ? origenOptions : destinoOptions;
    const title = isOrigen ? "Seleccionar origen" : "Seleccionar destino";

    return (
      <Stack spacing={1.25} sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {isOrigen ? <MyLocationIcon color="primary" /> : <FlagIcon color="primary" />}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 950 }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Busca una direccion o haz clic en el mapa.
            </Typography>
          </Box>
          {placesLoading === kind && <CircularProgress size={18} sx={{ ml: "auto" }} />}
          <IconButton size="small" onClick={() => setActivePanel(null)} sx={{ ml: placesLoading === kind ? 0 : "auto" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Autocomplete
          freeSolo
          options={options}
          loading={placesLoading === kind}
          loadingText="Buscando lugares..."
          noOptionsText={inputValue.trim().length < 3 ? "Escribe al menos 3 letras" : "Sin resultados"}
          filterOptions={(items) => items}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.description
          }
          onChange={(_, option) => selectPlace(kind, option)}
          inputValue={inputValue}
          onInputChange={(_, value) =>
            isOrigen ? setOrigenInput(value) : setDestinoInput(value)
          }
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
              label={isOrigen ? "Buscar origen" : "Buscar destino"}
              size="small"
              required
              error={routeMissingFields.includes(kind)}
              helperText={
                routeMissingFields.includes(kind)
                  ? `Selecciona el ${isOrigen ? "origen" : "destino"}`
                  : "Tambien puedes marcarlo directo en el mapa"
              }
            />
          )}
        />
      </Stack>
    );
  };

  const stopsPanel = (
    <Stack spacing={1.25} sx={{ p: 1.5 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <AddLocationAltIcon color="primary" />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 950 }}>
            Crear parada
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Haz clic en el mapa para agregarla a la ruta.
          </Typography>
        </Box>
        {paradas.some((parada) => parada.isResolving) && (
          <CircularProgress size={18} sx={{ ml: "auto" }} />
        )}
        <IconButton size="small" onClick={() => setActivePanel(null)} sx={{ ml: paradas.some((parada) => parada.isResolving) ? 0 : "auto" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
      {paradas.length === 0 ? (
        <Alert severity="info">Aun no agregas paradas.</Alert>
      ) : (
        <Stack spacing={1}>
          {paradas.map((point, index) => (
            <Box
              key={`${point.clientId || point.lat}-${point.lng}-${index}-panel`}
              sx={{
                p: 1,
                borderRadius: "8px",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                <Chip label={`P${index + 1}`} color="warning" size="small" />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 900 }} noWrap>
                    {point.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {point.direccion}
                  </Typography>
                  {point.isResolving && (
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mt: 0.5 }}>
                      <CircularProgress size={14} />
                      <Typography variant="caption" color="primary">
                        Resolviendo direccion
                      </Typography>
                    </Stack>
                  )}
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );

  const mapPanel =
    activePanel === "origen"
      ? placePanel("origen")
      : activePanel === "destino"
        ? placePanel("destino")
        : stopsPanel;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1fr) 390px" },
        gap: 2,
        alignItems: "start",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, order: { xs: 2, xl: 2 } }}>
        <PaperBlock
          title="Ruta reutilizable"
          subtitle="Los puntos se seleccionan desde los controles del mapa"
          contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.1 }}
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
          {isResolvingPoint && (
            <Alert severity="info" icon={<CircularProgress size={16} />}>
              Estamos resolviendo la direccion del punto marcado.
            </Alert>
          )}
        </PaperBlock>

        <PaperBlock
          title="Paradas y tiempos"
          subtitle="Cada parada suma minutos a la duración de la ruta"
          contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1 }}
        >
          {paradas.length === 0 ? (
            <Alert severity="info">Usa el control Crear parada del mapa.</Alert>
          ) : (
            <Stack spacing={0.9} sx={{ maxHeight: 220, overflow: "auto", pr: 0.5 }}>
              {paradas.map((point, index) => (
                <Box
                  key={`${point.clientId || point.lat}-${point.lng}-${index}`}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "34px minmax(0, 1fr) auto",
                    gap: 0.75,
                    alignItems: "center",
                    p: 0.9,
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Chip label={`P${index + 1}`} color="warning" size="small" />
                  <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                      {point.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {point.direccion}
                    </Typography>
                    {point.isResolving && (
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                        <CircularProgress size={12} />
                        <Typography variant="caption" color="primary">
                          Resolviendo
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 88,
                        height: 40,
                        px: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "8px",
                        backgroundColor: "background.paper",
                      }}
                    >
                      <Box
                        component="input"
                        type="number"
                        min={0}
                        value={point.tiempoParadaMin ?? DEFAULT_STOP_MINUTES}
                        onChange={(event) => {
                          const value = Math.max(0, Number(event.currentTarget.value) || 0);
                          setParadas((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, tiempoParadaMin: value } : item,
                            ),
                          );
                        }}
                        style={{
                          width: 38,
                          border: 0,
                          outline: 0,
                          font: "inherit",
                          fontWeight: 800,
                          textAlign: "center",
                          background: "transparent",
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        min
                      </Typography>
                    </Box>
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
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </PaperBlock>

        <PaperBlock
          title="Resumen"
          subtitle="Se enviara al backend con el trazo calculado"
          contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1 }}
        >
          <Stack spacing={1}>
            {pointSummary("O", origen, "#1f618d")}
            {pointSummary("D", destino, "#1f618d")}
          </Stack>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <Stack direction="row" sx={{ justifyContent: "space-between", p: 1 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                <RouteIcon color="primary" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  Distancia
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 950 }}>
                {draftRoute?.distanciaKm || "-"} km
              </Typography>
            </Stack>
            <Divider />
            <Stack direction="row" sx={{ justifyContent: "space-between", p: 1 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                <TimerIcon color="primary" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  Tiempo de la ruta
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 950 }}>
                {routeDriveMin || "-"} min
              </Typography>
            </Stack>
            <Divider />
            <Stack direction="row" sx={{ justifyContent: "space-between", p: 1 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                <AddLocationAltIcon color="warning" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  Tiempo en paradas
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 950 }}>
                {stopMinutes} min
              </Typography>
            </Stack>
            <Divider />
            <Stack direction="row" sx={{ justifyContent: "space-between", p: 1 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                <FlagIcon color="primary" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  Duracion total
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 950 }}>
                {draftRoute?.duracionMin || "-"} min
              </Typography>
            </Stack>
            <Divider />
            <Stack direction="row" sx={{ justifyContent: "space-between", p: 1 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                <AddLocationAltIcon color="warning" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  Total de paradas
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 950 }}>
                {paradas.length}
              </Typography>
            </Stack>
          </Box>
          <Button variant="contained" size="large" onClick={saveRoute} disabled={isSaving}>
            Guardar ruta
          </Button>
        </PaperBlock>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, order: { xs: 1, xl: 1 } }}>
        <PaperBlock
          title="Mapa del trayecto"
          subtitle="El trazo se calcula con Google Directions. Puedes arrastrar el camino para ajustar por donde pasa."
          paperProps={{ sx: { p: 0, overflow: "hidden" } }}
          contentWrapperSx={{ p: 0 }}
        >
          <GoogleRouteMap
            routes={draftMapRoutes}
            markerPoints={draftMapMarkers}
            height={660}
            title={`${origen?.nombre || "Origen"} -> ${destino?.nombre || "Destino"}`}
            editable
            editingTarget={target}
            onEditingTargetChange={openMapPanel}
            onMapPoint={applyMapPoint}
            onRouteMetrics={setStableRouteMetrics}
            editablePanel={activePanel ? mapPanel : null}
            editableTargetStatus={{
              origen: Boolean(origen),
              destino: Boolean(destino),
              parada: paradas.length > 0,
            }}
            showEditableHint={false}
            enableStreetView
            enableSimulation={Boolean(draftRoute)}
            simulationRoute={draftRoute}
            emptyMessage="Marca origen y destino para calcular el trayecto"
          />
        </PaperBlock>
      </Box>
    </Box>
  );
}
