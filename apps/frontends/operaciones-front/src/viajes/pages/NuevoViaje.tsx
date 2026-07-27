"use client";

import React from "react";
import {
  Breadcrumb,
  CommonPageProps,
  FormButtonsRow,
  PaperBlock,
  PaperHeader,
} from "@nexoroute/commons";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import LinkIcon from "@mui/icons-material/Link";
import RouteIcon from "@mui/icons-material/Route";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import GoogleRouteMap from "../components/GoogleRouteMap";
import { rutasBase } from "../data/viajesMock";
import GeoPoint from "../types/GeoPoint";
import RutaBase from "../types/RutaBase";
import {
  CONNECTION_TOLERANCE_METERS,
  buildConnectionSegments,
  getJourneyMetrics,
} from "../utils/routeUtils";

interface Props extends CommonPageProps {
  viajeId?: string;
}

const servicios = [
  "WiFi",
  "Aire acondicionado",
  "Equipaje",
  "Pantallas",
  "Cargadores USB",
];

const draftRoute: RutaBase = {
  id: 99,
  nombre: "Ruta nueva en diseno",
  descripcion: "Trayecto de trabajo con origen, paradas y destino.",
  color: "#2f855a",
  origen: {
    nombre: "Terminal Centro",
    direccion: "Centro, Cuernavaca, Morelos",
    lat: 18.9242,
    lng: -99.2216,
  },
  destino: {
    nombre: "Campus UTEZ",
    direccion: "Emiliano Zapata, Morelos",
    lat: 18.8505,
    lng: -99.2005,
  },
  paradas: [
    {
      nombre: "Hospital General",
      direccion: "Av. Plan de Ayala, Cuernavaca",
      lat: 18.9141,
      lng: -99.2145,
    },
    {
      nombre: "Jiutepec Centro",
      direccion: "Jiutepec, Morelos",
      lat: 18.8818,
      lng: -99.1776,
    },
  ],
  distanciaKm: 18.4,
  duracionMin: 42,
  estatus: true,
};

function RouteSelector({
  selectedRoutes,
  onToggle,
}: Readonly<{
  selectedRoutes: RutaBase[];
  onToggle: (route: RutaBase) => void;
}>) {
  return (
    <Stack spacing={1}>
      {rutasBase.map((ruta) => {
        const selected = selectedRoutes.some((item) => item.id === ruta.id);
        return (
          <Box
            key={ruta.id}
            sx={{
              p: 1.25,
              borderRadius: "8px",
              border: "1px solid",
              borderColor: selected ? "primary.main" : "divider",
              backgroundColor: selected
                ? "rgba(31, 97, 141, 0.07)"
                : "background.paper",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={selected}
                  onChange={() => onToggle(ruta)}
                />
              }
              label={
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>{ruta.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ruta.origen.nombre} a {ruta.destino.nombre}
                  </Typography>
                </Box>
              }
              sx={{ alignItems: "flex-start", m: 0 }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1, pl: 4.5 }}>
              <Chip label={`${ruta.distanciaKm} km`} size="small" />
              <Chip label={`${ruta.duracionMin} min`} size="small" />
              <Chip label={`${ruta.paradas.length} paradas`} size="small" />
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}

function StopRow({
  point,
  index,
}: Readonly<{ point: GeoPoint; index: number }>) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "28px 1fr auto",
        gap: 1,
        alignItems: "center",
        p: 1,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <DragIndicatorIcon color="disabled" fontSize="small" />
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 800 }}>
          {index + 1}. {point.nombre}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {point.direccion}
        </Typography>
      </Box>
      <Tooltip title="Quitar parada">
        <IconButton size="small" aria-label="Quitar parada">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default function NuevoViaje({
  navigationFunction,
  snack,
  viajeId,
}: Readonly<Props>) {
  const isEditing = Boolean(viajeId);
  const [tab, setTab] = React.useState(0);
  const [selectedRoutes, setSelectedRoutes] = React.useState<RutaBase[]>([
    rutasBase[0],
    rutasBase[3],
  ]);
  const [paradas, setParadas] = React.useState<GeoPoint[]>(draftRoute.paradas);

  const routeDraft = React.useMemo(
    () => ({
      ...draftRoute,
      paradas,
    }),
    [paradas],
  );
  const connections = React.useMemo(
    () => buildConnectionSegments(selectedRoutes, CONNECTION_TOLERANCE_METERS),
    [selectedRoutes],
  );
  const metrics = React.useMemo(
    () => getJourneyMetrics(selectedRoutes, connections),
    [selectedRoutes, connections],
  );

  const toggleSelectedRoute = (route: RutaBase) => {
    setSelectedRoutes((current) =>
      current.some((item) => item.id === route.id)
        ? current.filter((item) => item.id !== route.id)
        : [...current, route],
    );
  };

  const addMockStop = () => {
    setParadas((current) => [
      ...current,
      {
        nombre: `Parada ${current.length + 1}`,
        direccion: "Punto marcado en mapa",
        lat: 18.895 + current.length * 0.006,
        lng: -99.205 - current.length * 0.004,
      },
    ]);
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
        subtitle="Disena rutas, valida continuidad y deja lista la plantilla para calendario"
        iconname={isEditing ? "edit" : "add"}
        showButton
        onButtonClick={() => navigationFunction("/dashboard/trips")}
        buttonTitle="Volver"
        leftIcon={<ChevronLeftIcon />}
      />

      <PaperBlock
        paperProps={{
          sx: {
            p: 0,
            overflow: "hidden",
          },
        }}
        contentWrapperSx={{ p: 0 }}
      >
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Tab icon={<AltRouteIcon />} iconPosition="start" label="Componer viaje" />
          <Tab icon={<RouteIcon />} iconPosition="start" label="Crear ruta" />
        </Tabs>
      </PaperBlock>

      {tab === 0 && (
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <PaperBlock
              title="Datos del viaje"
              subtitle="Nombre y reglas de reutilizacion para abrir salidas despues"
              contentWrapperSx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 1.5,
              }}
            >
              <TextField
                label="Nombre del viaje base"
                size="small"
                defaultValue={isEditing ? "Circuito campus retorno" : ""}
                fullWidth
              />
              <TextField
                select
                label="Frecuencia"
                size="small"
                defaultValue="lunes-viernes"
                fullWidth
              >
                <MenuItem value="lunes-viernes">Lunes a viernes</MenuItem>
                <MenuItem value="interdiario">Lunes, miercoles y viernes</MenuItem>
                <MenuItem value="demanda">Bajo demanda</MenuItem>
              </TextField>
              <TextField
                label="Descripcion"
                size="small"
                multiline
                rows={3}
                fullWidth
                sx={{ gridColumn: { md: "1 / -1" } }}
              />
            </PaperBlock>

            <PaperBlock
              title="Rutas reutilizables"
              subtitle="El orden de seleccion define el recorrido del autobus"
              contentMaxHeight={480}
            >
              <RouteSelector
                selectedRoutes={selectedRoutes}
                onToggle={toggleSelectedRoute}
              />
            </PaperBlock>

            <PaperBlock
              title="Servicios asociados"
              subtitle="Se copiaran a cada salida que abras en calendario"
              contentWrapperSx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1,
              }}
            >
              {servicios.map((servicio, index) => (
                <FormControlLabel
                  key={servicio}
                  control={<Checkbox defaultChecked={index < 3} />}
                  label={servicio}
                />
              ))}
            </PaperBlock>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <PaperBlock
              title="Vista de continuidad"
              subtitle="Si dos rutas no empatan, se pinta un enlace operativo editable"
              paperProps={{ sx: { p: 0, overflow: "hidden" } }}
              contentWrapperSx={{ p: 0 }}
            >
              <GoogleRouteMap
                routes={selectedRoutes}
                connections={connections}
                height={560}
                title={
                  connections.length === 0
                    ? "Composicion conectada"
                    : "Composicion con enlaces propuestos"
                }
              />
            </PaperBlock>

            <PaperBlock
              title="Resumen"
              subtitle={`Tolerancia de conexion: ${CONNECTION_TOLERANCE_METERS} m`}
              contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.25 }}
            >
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                <Chip label={`${selectedRoutes.length} rutas`} color="primary" />
                <Chip label={`${metrics.distanceKm.toFixed(1)} km`} />
                <Chip label={`${Math.round(metrics.durationMin)} min`} />
                <Chip
                  icon={<LinkIcon />}
                  label={
                    connections.length === 0
                      ? "Sin enlaces extra"
                      : `${connections.length} enlace(s)`
                  }
                  color={connections.length === 0 ? "success" : "warning"}
                />
              </Stack>
              <Divider />
              {selectedRoutes.map((route, index) => (
                <Box
                  key={route.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr",
                    gap: 1,
                    alignItems: "start",
                  }}
                >
                  <Chip label={index + 1} size="small" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {route.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {route.origen.nombre} a {route.destino.nombre}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </PaperBlock>
          </Box>
        </Box>
      )}

      {tab === 1 && (
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <PaperBlock
              title="Puntos principales"
              subtitle="Busca direccion o marca puntos en el mapa cuando Google Maps este activo"
              contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
            >
              <TextField
                label="Nombre de la ruta"
                size="small"
                defaultValue="Ruta Centro - Universidad"
                fullWidth
              />
              <TextField
                label="Origen"
                size="small"
                defaultValue={draftRoute.origen.direccion}
                fullWidth
              />
              <TextField
                label="Destino"
                size="small"
                defaultValue={draftRoute.destino.direccion}
                fullWidth
              />
              <TextField
                label="Descripcion"
                size="small"
                multiline
                rows={3}
                defaultValue={draftRoute.descripcion}
                fullWidth
              />
            </PaperBlock>

            <PaperBlock
              title="Paradas"
              subtitle="Las paradas deben quedar sobre el trayecto vigente"
              contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1 }}
            >
              {paradas.map((point, index) => (
                <StopRow key={`${point.nombre}-${index}`} point={point} index={index} />
              ))}
              <Button
                variant="outlined"
                startIcon={<AddLocationAltIcon />}
                onClick={addMockStop}
              >
                Agregar parada
              </Button>
            </PaperBlock>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <PaperBlock
              title="Diseno de ruta"
              subtitle="El trazo se recalculara con origen, destino, paradas y puntos manuales"
              paperProps={{ sx: { p: 0, overflow: "hidden" } }}
              contentWrapperSx={{ p: 0 }}
            >
              <GoogleRouteMap routes={[routeDraft]} height={620} title="Ruta en construccion" />
            </PaperBlock>
            <PaperBlock
              title="Criterios de guardado"
              subtitle="Datos geograficos que se conservaran para pintar y editar la ruta"
              contentWrapperSx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 1,
              }}
            >
              {[
                "Origen y destino con lat/lng",
                "PlaceId y direccion legible",
                "Paradas ordenadas",
                "Polyline codificada de Google",
                "Waypoints manuales",
                "Estatus de publicacion",
              ].map((item) => (
                <Chip key={item} label={item} variant="outlined" />
              ))}
            </PaperBlock>
          </Box>
        </Box>
      )}

      <FormButtonsRow
        hasRequiredFields
        submitText={tab === 0 ? "Guardar viaje base" : "Guardar ruta"}
        resetText="Cancelar"
        onSubmitClick={() => {
          snack?.success({
            message:
              tab === 0
                ? isEditing
                  ? "Viaje base actualizado"
                  : "Viaje base creado"
                : "Ruta guardada",
          });
          navigationFunction("/dashboard/trips");
        }}
        onResetClick={() => navigationFunction("/dashboard/trips")}
      />
    </>
  );
}
