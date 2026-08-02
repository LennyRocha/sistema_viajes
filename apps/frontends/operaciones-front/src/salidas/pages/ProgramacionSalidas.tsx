"use client";

import React from "react";
import {
  Breadcrumb,
  CommonPageProps,
  PaperBlock,
  PaperHeader,
} from "@nexoroute/commons";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PersonIcon from "@mui/icons-material/Person";
import RouteIcon from "@mui/icons-material/Route";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import GoogleRouteMap from "../../viajes/components/GoogleRouteMap";
import VehicleModelPreview, {
  VehicleModelName,
} from "../../viajes/components/VehicleModelPreview";
import { mapViajeApi } from "../../viajes/utils/apiMappers";
import {
  buildConnectionSegments,
  buildJourneySimulationPath,
  getJourneyMetrics,
} from "../../viajes/utils/routeUtils";
import ViajeBase from "../../viajes/types/ViajeBase";
import {
  createSalida,
  getSalidasCatalogData,
} from "../api/salidasHttp";
import {
  AutobusResumen,
  ConductorResumen,
  InstitucionResumen,
  PrecioRutaSalida,
} from "../types/SalidasApi";

interface Props extends CommonPageProps {}

const DEFAULT_VIAJE_IMAGE = "/imagen_defecto_viajes.jpg";
const STEPS = [
  "Viaje",
  "Rutas y precios",
  "Fecha y hora",
  "Unidad y conductor",
  "Resumen",
];

function formatDuration(minutes?: number | null) {
  const value = Number(minutes || 0);
  if (value <= 0) return "Sin calcular";
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return mins ? `${hours} h ${mins} min` : `${hours} h`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value || 0);
}

function fullDriverName(driver?: ConductorResumen | null) {
  if (!driver) return "Sin conductor";
  return [
    driver.nombres,
    driver.apellido_paterno,
    driver.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ");
}

function vehicleModelFromBus(bus?: AutobusResumen | null): VehicleModelName {
  const text = `${bus?.marca || ""} ${bus?.modelo || ""} ${bus?.tipoAutobus?.nombre || ""}`.toLowerCase();
  if (text.includes("mercedes") || text.includes("sprinter")) return "mercedes";
  if (text.includes("volks") || text.includes("crafter")) return "volkswagen";
  return "hyundai";
}

function dateTimeLabel(date: string, time: string) {
  if (!date || !time) return "Pendiente";
  return `${date} - ${time}`;
}

function StatCard({
  label,
  value,
  color = "primary.main",
}: Readonly<{
  label: string;
  value: string;
  color?: string;
}>) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 950, color, lineHeight: 1.15 }}>
        {value}
      </Typography>
    </Box>
  );
}

function TripCard({
  viaje,
  selected,
  onSelect,
}: Readonly<{
  viaje: ViajeBase;
  selected: boolean;
  onSelect: () => void;
}>) {
  return (
    <Box
      component="button"
      onClick={onSelect}
      sx={{
        p: 0,
        textAlign: "left",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: selected ? "rgba(31, 97, 141, 0.06)" : "background.paper",
        boxShadow: selected
          ? "0 14px 28px rgba(31, 97, 141, 0.16)"
          : "0 8px 18px rgba(15, 23, 42, 0.06)",
        cursor: "pointer",
        transition: "transform 140ms ease, box-shadow 140ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 16px 30px rgba(15, 23, 42, 0.12)",
        },
      }}
    >
      <Box sx={{ position: "relative", height: 128 }}>
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
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.58))",
          }}
        />
        <Chip
          label={selected ? "Seleccionado" : viaje.estatus ? "Activo" : "Inactivo"}
          color={selected ? "primary" : viaje.estatus ? "success" : "default"}
          size="small"
          sx={{ position: "absolute", right: 10, top: 10, fontWeight: 850 }}
        />
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ position: "absolute", left: 12, bottom: 10 }}
        >
          <Chip
            icon={<RouteIcon />}
            label={`${viaje.rutas.length} rutas`}
            size="small"
            sx={{ backgroundColor: "rgba(255,255,255,0.92)" }}
          />
          <Chip
            label={formatDuration(viaje.duracionTotalMin)}
            size="small"
            sx={{ backgroundColor: "rgba(255,255,255,0.92)" }}
          />
        </Stack>
      </Box>
      <Box sx={{ p: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 950, lineHeight: 1.15 }}>
          {viaje.nombre}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 40,
          }}
        >
          {viaje.descripcion || "Viaje base listo para programar salidas."}
        </Typography>
      </Box>
    </Box>
  );
}

function SelectionCard({
  selected,
  title,
  subtitle,
  meta,
  avatar,
  onClick,
}: Readonly<{
  selected: boolean;
  title: string;
  subtitle: string;
  meta?: string;
  avatar: React.ReactNode;
  onClick: () => void;
}>) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        width: "100%",
        p: 1.25,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        display: "grid",
        gridTemplateColumns: "54px minmax(0, 1fr) auto",
        gap: 1.25,
        alignItems: "center",
        textAlign: "left",
        backgroundColor: selected ? "rgba(31, 97, 141, 0.06)" : "background.paper",
        cursor: "pointer",
      }}
    >
      {avatar}
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 950 }} noWrap>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {subtitle}
        </Typography>
        {meta && (
          <Typography variant="caption" sx={{ display: "block", color: "success.main", fontWeight: 800 }}>
            {meta}
          </Typography>
        )}
      </Box>
      {selected && <CheckCircleIcon color="primary" />}
    </Box>
  );
}

export default function ProgramacionSalidas({ snack }: Readonly<Props>) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [loadError, setLoadError] = React.useState("");
  const [viajesData, setViajesData] = React.useState<ViajeBase[]>([]);
  const [instituciones, setInstituciones] = React.useState<InstitucionResumen[]>([]);
  const [autobuses, setAutobuses] = React.useState<AutobusResumen[]>([]);
  const [conductores, setConductores] = React.useState<ConductorResumen[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = React.useState<number | "all">("all");
  const [search, setSearch] = React.useState("");
  const [selectedViajeId, setSelectedViajeId] = React.useState<number | null>(null);
  const [prices, setPrices] = React.useState<Record<number, string>>({});
  const [fecha, setFecha] = React.useState("");
  const [hora, setHora] = React.useState("");
  const [selectedBusId, setSelectedBusId] = React.useState<number | null>(null);
  const [selectedDriverId, setSelectedDriverId] = React.useState<number | null>(null);

  const loadData = React.useCallback(async (institutionId?: number) => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await getSalidasCatalogData({ institucionId: institutionId });
      const mappedViajes = response.viajes.map(mapViajeApi);
      setViajesData(mappedViajes);
      setInstituciones(response.instituciones);
      setAutobuses(response.autobuses.filter((bus) => bus.estatus !== false));
      setConductores(response.conductores.filter((driver) => driver.estatus !== false));
      setLoadError(response.errores?.join(" | ") || "");
      setSelectedViajeId((current) =>
        current && mappedViajes.some((viaje) => viaje.id === current)
          ? current
          : mappedViajes[0]?.id || null,
      );
      setSelectedBusId((current) =>
        current && response.autobuses.some((bus) => bus.id === current)
          ? current
          : response.autobuses.find((bus) => bus.estatus !== false)?.id || null,
      );
      setSelectedDriverId((current) =>
        current && response.conductores.some((driver) => driver.id === current)
          ? current
          : response.conductores.find((driver) => driver.estatus !== false)?.id || null,
      );
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el catalogo para programar salidas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData(
      selectedInstitutionId === "all" ? undefined : selectedInstitutionId,
    );
  }, [loadData, selectedInstitutionId]);

  const viajes = React.useMemo(
    () =>
      viajesData.filter((viaje) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return `${viaje.nombre} ${viaje.descripcion}`.toLowerCase().includes(q);
      }),
    [search, viajesData],
  );

  const selectedViaje = React.useMemo(
    () => viajesData.find((viaje) => viaje.id === selectedViajeId) || viajesData[0],
    [selectedViajeId, viajesData],
  );

  const selectedRoutes = selectedViaje?.rutas || [];
  const selectedBus = React.useMemo(
    () => autobuses.find((bus) => bus.id === selectedBusId) || null,
    [autobuses, selectedBusId],
  );
  const selectedDriver = React.useMemo(
    () => conductores.find((driver) => driver.id === selectedDriverId) || null,
    [conductores, selectedDriverId],
  );
  const connections = React.useMemo(
    () => buildConnectionSegments(selectedRoutes),
    [selectedRoutes],
  );
  const metrics = React.useMemo(
    () => getJourneyMetrics(selectedRoutes, connections),
    [connections, selectedRoutes],
  );
  const simulationPath = React.useMemo(
    () => buildJourneySimulationPath(selectedRoutes, connections),
    [connections, selectedRoutes],
  );
  const totalPrice = React.useMemo(
    () =>
      selectedRoutes.reduce(
        (total, route) => total + (Number(prices[route.id]) || 0),
        0,
      ),
    [prices, selectedRoutes],
  );

  React.useEffect(() => {
    if (!selectedViaje) return;
    setPrices((current) => {
      const next: Record<number, string> = {};
      selectedViaje.rutas.forEach((route) => {
        next[route.id] = current[route.id] || "";
      });
      return next;
    });
  }, [selectedViaje]);

  const validation = React.useMemo(() => {
    const routePrices = selectedRoutes.map((route) => Number(prices[route.id]) || 0);
    return {
      hasViaje: Boolean(selectedViaje),
      hasPrices: selectedRoutes.length > 0 && routePrices.every((price) => price > 0),
      hasDateTime: Boolean(fecha && hora),
      hasCrew: Boolean(selectedBusId && selectedDriverId),
    };
  }, [fecha, hora, prices, selectedBusId, selectedDriverId, selectedRoutes, selectedViaje]);

  const canContinue = [
    validation.hasViaje,
    validation.hasPrices,
    validation.hasDateTime,
    validation.hasCrew,
    validation.hasViaje && validation.hasPrices && validation.hasDateTime && validation.hasCrew,
  ][activeStep];

  const goNext = () => {
    if (!canContinue) return;
    setActiveStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const saveSalida = async () => {
    if (!selectedViaje || !selectedBusId || !selectedDriverId || !fecha || !hora) {
      snack?.error({ message: "Completa los pasos antes de guardar la salida." });
      return;
    }

    const routePrices: PrecioRutaSalida[] = selectedRoutes.map((route, index) => ({
      rutaId: route.id,
      orden: index + 1,
      nombre: route.nombre,
      precio: Number(prices[route.id]) || 0,
    }));

    if (routePrices.some((route) => route.precio <= 0)) {
      snack?.error({ message: "Cada ruta necesita un precio mayor a cero." });
      setActiveStep(1);
      return;
    }

    try {
      setIsSaving(true);
      await createSalida({
        autobusId: selectedBusId,
        conductorId: selectedDriverId,
        viajeBaseId: selectedViaje.id,
        horario_configuracion: {
          fecha,
          hora,
          fechaHoraLocal: `${fecha}T${hora}`,
          zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Mexico_City",
        },
        tipoSalida: "UNICA",
        estadoSalida: "PROGRAMADO",
        precios: {
          moneda: "MXN",
          rutas: routePrices,
        },
      });
      snack?.success({ message: "Salida programada correctamente." });
      setActiveStep(0);
    } catch (error) {
      snack?.error({
        message:
          error instanceof Error
            ? `No se pudo programar la salida: ${error.message}`
            : "No se pudo programar la salida.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    if (isLoading) {
      return (
        <PaperBlock>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <CircularProgress size={22} />
            <Typography>Cargando viajes, autobuses y conductores...</Typography>
          </Stack>
        </PaperBlock>
      );
    }

    if (activeStep === 0) {
      return (
        <PaperBlock
          title="Paso 1 - Selecciona viaje base"
          subtitle="La salida hereda rutas, paradas e imagen del viaje base."
          contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "220px minmax(0, 1fr)" },
              gap: 1,
            }}
          >
            <TextField
              select
              label="Institucion"
              value={selectedInstitutionId}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedInstitutionId(value === "all" ? "all" : Number(value));
              }}
              size="small"
            >
              <MenuItem value="all">Todas</MenuItem>
              {instituciones.map((institucion) => (
                <MenuItem key={institucion.id} value={institucion.id}>
                  {institucion.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Buscar viaje"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
          {viajes.length === 0 ? (
            <Alert severity="info">
              No hay viajes base activos para la busqueda actual.
            </Alert>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 1.5,
              }}
            >
              {viajes.map((viaje) => (
                <TripCard
                  key={viaje.id}
                  viaje={viaje}
                  selected={selectedViaje?.id === viaje.id}
                  onSelect={() => setSelectedViajeId(viaje.id)}
                />
              ))}
            </Box>
          )}
        </PaperBlock>
      );
    }

    if (activeStep === 1) {
      return (
        <PaperBlock
          title="Paso 2 - Rutas y precios"
          subtitle="Captura el precio del boleto para cada ruta del viaje."
          contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
        >
          <GoogleRouteMap
            routes={selectedRoutes}
            connections={connections}
            height={360}
            title="Render de rutas del viaje"
            enableSimulation={simulationPath.length > 1}
            simulationPath={simulationPath}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 1 }}>
            {selectedRoutes.map((route, index) => (
              <Box
                key={route.id}
                sx={{
                  p: 1.25,
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: "divider",
                  display: "grid",
                  gridTemplateColumns: "34px minmax(0, 1fr) 140px",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Avatar sx={{ width: 30, height: 30, bgcolor: route.color || "primary.main", fontSize: 13 }}>
                  {index + 1}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 950 }} noWrap>
                    {route.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {route.origen.nombre} - {route.destino.nombre}
                  </Typography>
                </Box>
                <TextField
                  label="Precio"
                  type="number"
                  size="small"
                  value={prices[route.id] || ""}
                  onChange={(event) =>
                    setPrices((current) => ({
                      ...current,
                      [route.id]: event.target.value,
                    }))
                  }
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
          {!validation.hasPrices && (
            <Alert severity="warning">
              Todas las rutas deben tener un precio mayor a cero para continuar.
            </Alert>
          )}
        </PaperBlock>
      );
    }

    if (activeStep === 2) {
      return (
        <PaperBlock
          title="Paso 3 - Fecha y hora"
          subtitle="Primero define la fecha de salida y despues la hora exacta."
          contentWrapperSx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}
        >
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <CalendarMonthIcon color="primary" />
              <Typography sx={{ fontWeight: 950 }}>Fecha de salida</Typography>
            </Stack>
            <TextField
              type="date"
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Box sx={{ mt: 1.5, p: 1.5, borderRadius: "8px", bgcolor: "rgba(31,97,141,0.06)" }}>
              <Typography variant="caption" color="text.secondary">
                Vista del calendario
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 0.5,
                  mt: 1,
                }}
              >
                {["L", "M", "M", "J", "V", "S", "D"].map((day) => (
                  <Typography key={day} variant="caption" sx={{ textAlign: "center", fontWeight: 900 }}>
                    {day}
                  </Typography>
                ))}
                {Array.from({ length: 28 }, (_, index) => index + 1).map((day) => (
                  <Box
                    key={day}
                    sx={{
                      height: 32,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "50%",
                      color: fecha.endsWith(String(day).padStart(2, "0")) ? "white" : "text.primary",
                      bgcolor: fecha.endsWith(String(day).padStart(2, "0")) ? "primary.main" : "transparent",
                    }}
                  >
                    <Typography variant="caption">{day}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <AccessTimeIcon color="primary" />
              <Typography sx={{ fontWeight: 950 }}>Hora de salida</Typography>
            </Stack>
            <TextField
              type="time"
              value={hora}
              onChange={(event) => setHora(event.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Box sx={{ mt: 1.5, p: 1, borderRadius: "8px", border: "1px solid", borderColor: "divider" }}>
              {["06:30", "07:00", "07:30", "08:00", "08:30"].map((option) => (
                <Box
                  key={option}
                  component="button"
                  onClick={() => setHora(option)}
                  sx={{
                    width: "100%",
                    border: 0,
                    p: 1,
                    borderRadius: "6px",
                    textAlign: "left",
                    bgcolor: hora === option ? "rgba(31,97,141,0.12)" : "transparent",
                    color: hora === option ? "primary.main" : "text.primary",
                    fontWeight: hora === option ? 900 : 500,
                    cursor: "pointer",
                  }}
                >
                  {option}
                </Box>
              ))}
            </Box>
          </Box>
        </PaperBlock>
      );
    }

    if (activeStep === 3) {
      return (
        <PaperBlock
          title="Paso 4 - Unidad y conductor"
          subtitle="Selecciona autobus y conductor disponibles para la institucion."
          contentWrapperSx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}
        >
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <DirectionsBusIcon color="primary" />
              <Typography sx={{ fontWeight: 950 }}>Autobus</Typography>
            </Stack>
            {selectedBus && <VehicleModelPreview model={vehicleModelFromBus(selectedBus)} />}
            {autobuses.length === 0 ? (
              <Alert severity="info">No hay autobuses activos para la institucion seleccionada.</Alert>
            ) : (
              autobuses.map((bus) => (
                <SelectionCard
                  key={bus.id}
                  selected={selectedBusId === bus.id}
                  title={`${bus.alias || bus.codigo_interno || `Bus ${bus.id}`} - ${bus.marca || "Marca"} ${bus.modelo || ""}`}
                  subtitle={`${bus.tipoAutobus?.nombre || "Tipo sin clasificar"} - ${bus.capacidad || 0} asientos`}
                  meta={bus.estado ? `Estado: ${bus.estado}` : undefined}
                  avatar={
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <DirectionsBusIcon />
                    </Avatar>
                  }
                  onClick={() => setSelectedBusId(bus.id || null)}
                />
              ))
            )}
          </Stack>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <PersonIcon color="primary" />
              <Typography sx={{ fontWeight: 950 }}>Conductor</Typography>
            </Stack>
            {conductores.length === 0 ? (
              <Alert severity="info">No hay conductores activos para la institucion seleccionada.</Alert>
            ) : (
              conductores.map((driver) => (
                <SelectionCard
                  key={driver.id}
                  selected={selectedDriverId === driver.id}
                  title={fullDriverName(driver)}
                  subtitle={driver.email || driver.telefono || "Sin contacto registrado"}
                  meta={driver.licencia ? "Licencia vigente registrada" : "Sin licencia en respuesta"}
                  avatar={
                    <Avatar src={driver.foto_perfil || undefined} sx={{ bgcolor: "secondary.main" }}>
                      {driver.nombres?.[0] || "C"}
                    </Avatar>
                  }
                  onClick={() => setSelectedDriverId(driver.id)}
                />
              ))
            )}
          </Stack>
        </PaperBlock>
      );
    }

    return (
      <PaperBlock
        title="Paso 5 - Resumen"
        subtitle="Revisa la programacion antes de publicar la salida."
        contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 1 }}>
          <StatCard label="Viaje" value={selectedViaje?.nombre || "Pendiente"} />
          <StatCard label="Fecha y hora" value={dateTimeLabel(fecha, hora)} />
          <StatCard label="Unidad" value={selectedBus?.alias || selectedBus?.codigo_interno || "Pendiente"} />
          <StatCard label="Total rutas" value={formatCurrency(totalPrice)} color="success.main" />
        </Box>
        <Divider />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 1.5 }}>
          <Stack spacing={1}>
            <Typography sx={{ fontWeight: 950 }}>Precios por ruta</Typography>
            {selectedRoutes.map((route, index) => (
              <Stack
                key={route.id}
                direction="row"
                sx={{ justifyContent: "space-between", p: 1, borderRadius: "8px", bgcolor: "background.default" }}
              >
                <Typography variant="body2">
                  {index + 1}. {route.nombre}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 950 }}>
                  {formatCurrency(Number(prices[route.id]) || 0)}
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Stack spacing={1}>
            <Typography sx={{ fontWeight: 950 }}>Asignacion</Typography>
            <Alert severity="info">
              La salida se guarda como PROGRAMADO y tipo UNICA. El backend deja estatus en false hasta que se active el flujo operativo.
            </Alert>
            <Typography variant="body2">
              Conductor: <strong>{fullDriverName(selectedDriver)}</strong>
            </Typography>
            <Typography variant="body2">
              Autobus: <strong>{selectedBus?.marca || ""} {selectedBus?.modelo || ""}</strong>
            </Typography>
          </Stack>
        </Box>
      </PaperBlock>
    );
  };

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          { nombre: "Salidas", href: "/dashboard/salidas", disabled: true },
          { nombre: "Programacion", href: "/dashboard/salidas/programacion", disabled: true },
        ]}
      />
      <PaperHeader
        title="Programacion de salidas"
        subtitle="Flujo guiado para elegir viaje base, configurar rutas, fecha, unidad y conductor."
        iconname="calendar"
        showButton={false}
      />

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      <PaperBlock
        paperProps={{ sx: { mb: 2 } }}
        contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
      >
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </PaperBlock>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1fr) 360px" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Box>{renderStep()}</Box>
        <Stack spacing={2} sx={{ position: { xl: "sticky" }, top: 16 }}>
          <PaperBlock
            title="Resumen de salida"
            subtitle="Seleccion actual del flujo"
            contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.25 }}
          >
            {selectedViaje && (
              <Box
                component="img"
                src={selectedViaje.imagenBase64 || selectedViaje.imagenUrl || DEFAULT_VIAJE_IMAGE}
                alt={selectedViaje.nombre}
                sx={{
                  width: "100%",
                  height: 132,
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
            )}
            <Stack spacing={0.75}>
              <Chip icon={<EventAvailableIcon />} label={dateTimeLabel(fecha, hora)} />
              <Chip icon={<AltRouteIcon />} label={`${selectedRoutes.length} rutas`} />
              <Chip icon={<DirectionsBusIcon />} label={selectedBus?.alias || selectedBus?.codigo_interno || "Autobus pendiente"} />
              <Chip icon={<PersonIcon />} label={fullDriverName(selectedDriver)} />
            </Stack>
            <Divider />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <StatCard label="Distancia" value={`${metrics.distanceKm.toFixed(1)} km`} />
              <StatCard label="Duracion" value={formatDuration(Math.round(metrics.durationMin))} />
            </Box>
            <Box
              sx={{
                p: 1.25,
                borderRadius: "8px",
                color: "white",
                bgcolor: "primary.main",
              }}
            >
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.74)" }}>
                Total base por ruta
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 950 }}>
                {formatCurrency(totalPrice)}
              </Typography>
            </Box>
          </PaperBlock>
        </Stack>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          justifyContent: "space-between",
          mt: 2,
          pb: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          disabled={activeStep === 0 || isSaving}
          onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
        >
          Anterior
        </Button>
        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            disabled={!canContinue || isSaving}
            onClick={goNext}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            disabled={!canContinue || isSaving}
            onClick={saveSalida}
          >
            Guardar salida
          </Button>
        )}
      </Stack>
    </>
  );
}
