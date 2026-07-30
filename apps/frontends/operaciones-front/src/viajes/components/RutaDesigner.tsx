"use client";

import React from "react";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeleteIcon from "@mui/icons-material/Delete";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { PaperBlock } from "@nexoroute/commons";
import GoogleRouteMap, {
  PlaceSuggestion,
  RouteMetrics,
  getPlaceDetails,
  geocodeAddress,
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

  const searchPoint = async (kind: "origen" | "destino") => {
    const address = kind === "origen" ? origenInput : destinoInput;
    if (!address.trim()) return;

    try {
      const point = await geocodeAddress(address, apiKey);
      if (kind === "origen") setOrigen({ ...point, nombre: "Origen" });
      else setDestino({ ...point, nombre: "Destino" });
      setRouteMissingFields((current) => current.filter((field) => field !== kind));
    } catch {
      snack?.error?.({ message: "No se encontro esa direccion en Google Maps" });
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
            (total, parada) => total + (parada.tiempoParadaMin || 0) * 60,
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

  return (
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
          subtitle="Busca direcciones o haz clic directo en el mapa segun el modo activo"
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

          {(["origen", "destino"] as const).map((kind) => {
            const isOrigen = kind === "origen";
            return (
              <Stack key={kind} direction="row" spacing={1}>
                <Autocomplete
                  freeSolo
                  options={isOrigen ? origenOptions : destinoOptions}
                  loading={placesLoading === kind}
                  loadingText="Buscando lugares..."
                  noOptionsText={
                    (isOrigen ? origenInput : destinoInput).trim().length < 3
                      ? "Escribe al menos 3 letras"
                      : "Sin resultados"
                  }
                  filterOptions={(options) => options}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.description
                  }
                  onChange={(_, option) => selectPlace(kind, option)}
                  inputValue={isOrigen ? origenInput : destinoInput}
                  onInputChange={(_, value) =>
                    isOrigen ? setOrigenInput(value) : setDestinoInput(value)
                  }
                  onFocus={() => setTarget(kind)}
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
                      label={isOrigen ? "Origen" : "Destino"}
                      size="small"
                      fullWidth
                      required
                      error={routeMissingFields.includes(kind)}
                      helperText={
                        routeMissingFields.includes(kind)
                          ? `Busca o marca el ${isOrigen ? "origen" : "destino"} en el mapa`
                          : `Al enfocar este campo, el clic del mapa asigna ${isOrigen ? "origen" : "destino"}`
                      }
                    />
                  )}
                  sx={{ flex: 1 }}
                />
                <Tooltip title={isOrigen ? "Buscar origen" : "Buscar destino"}>
                  <IconButton onClick={() => {
                    setTarget(kind);
                    searchPoint(kind);
                  }}>
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            );
          })}

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
                        itemIndex === index ? { ...item, tiempoParadaMin: value } : item,
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
            enableSimulation={Boolean(draftRoute)}
            simulationRoute={draftRoute}
          />
        </PaperBlock>
        <PaperBlock
          title="Datos calculados"
          subtitle="Estos valores se mandan al backend al guardar la ruta"
          contentWrapperSx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}
        >
          <Chip label={`${draftRoute?.distanciaKm || "-"} km`} color="primary" />
          <Chip label={`${draftRoute?.duracionMin || "-"} min`} />
          <Chip label={`${paradas.length} parada(s)`} />
          <Chip label={apiKey ? "Google Maps activo" : "Falta API key"} />
          <Button variant="contained" onClick={saveRoute} disabled={isSaving} sx={{ ml: "auto" }}>
            Guardar ruta
          </Button>
        </PaperBlock>
      </Box>
    </Box>
  );
}
