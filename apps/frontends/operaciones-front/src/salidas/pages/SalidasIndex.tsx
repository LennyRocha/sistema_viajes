"use client";

import React from "react";
import {
  Breadcrumb,
  CommonPageProps,
  PaperBlock,
  PaperHeader,
  hasPrivilege,
} from "@nexoroute/commons";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import CancelIcon from "@mui/icons-material/Cancel";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaymentsIcon from "@mui/icons-material/Payments";
import PersonIcon from "@mui/icons-material/Person";
import RouteIcon from "@mui/icons-material/Route";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  cancelSalida,
  getActiveAutobuses,
  getActiveConductores,
  getSalidas,
  updateSalida,
} from "../api/salidasHttp";
import {
  AutobusResumen,
  ConductorResumen,
  EstadoSalida,
  HorarioConfiguracionSalida,
  SalidaDetalle,
  TipoSalida,
} from "../types/SalidasApi";
import { fullDriverName } from "../utils/formatters";

interface Props extends CommonPageProps {}

const STATUS_META: Record<
  EstadoSalida,
  {
    label: string;
    color: "success" | "warning" | "error" | "default";
    accent: string;
  }
> = {
  PROGRAMADO: {
    label: "Programado",
    color: "warning",
    accent: "#f97316",
  },
  EN_CURSO: {
    label: "En curso",
    color: "success",
    accent: "#16a34a",
  },
  FINALIZADO: {
    label: "Finalizado",
    color: "default",
    accent: "#64748b",
  },
  CANCELADO: {
    label: "Cancelado",
    color: "error",
    accent: "#dc2626",
  },
};

const TYPE_LABELS: Record<TipoSalida, string> = {
  UNICA: "Unica",
  RECURRENTE: "Recurrente",
  ESPECIAL: "Especial",
};

const DAY_LABELS: Record<string, string> = {
  LUNES: "Lun",
  MARTES: "Mar",
  MIERCOLES: "Mie",
  JUEVES: "Jue",
  VIERNES: "Vie",
  SABADO: "Sab",
  DOMINGO: "Dom",
  MONDAY: "Lun",
  TUESDAY: "Mar",
  WEDNESDAY: "Mie",
  THURSDAY: "Jue",
  FRIDAY: "Vie",
  SATURDAY: "Sab",
  SUNDAY: "Dom",
};

type PlaceValue = Record<string, any> | string | null | undefined;

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value || 0));
}

function parseMaybeJson(value: PlaceValue): Record<string, any> | string | null {
  if (!value) return null;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function isGenericPlaceName(value?: string | null) {
  const normalized = value?.trim().toLowerCase();
  return !normalized || normalized === "origen" || normalized === "destino";
}

function formatPlace(value: PlaceValue, fallback: string) {
  const parsed = parseMaybeJson(value);
  if (!parsed) return fallback;
  if (typeof parsed === "string") return parsed || fallback;

  const name = typeof parsed.nombre === "string" ? parsed.nombre.trim() : "";
  const address =
    typeof parsed.direccion === "string" ? parsed.direccion.trim() : "";
  const lat = parsed.lat ?? parsed.latitude;
  const lng = parsed.lng ?? parsed.longitude;

  if (address && !isGenericPlaceName(name)) return `${name} - ${address}`;
  if (address) return address;
  if (name) return name;
  if (lat != null && lng != null) {
    return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
  }
  return fallback;
}

function formatPlaceShort(value: PlaceValue, fallback: string) {
  const parsed = parseMaybeJson(value);
  if (!parsed) return fallback;
  if (typeof parsed === "string") return parsed || fallback;

  const name = typeof parsed.nombre === "string" ? parsed.nombre.trim() : "";
  const address =
    typeof parsed.direccion === "string" ? parsed.direccion.trim() : "";

  if (!isGenericPlaceName(name)) return name;
  if (address) return address.split(",")[0]?.trim() || fallback;
  return fallback;
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatDateTimeLocal(value?: string | null) {
  if (!value) return "";
  if (!value.includes("T")) return value;

  const [date, time = ""] = value.split("T");
  return `${formatDate(date)} ${time.slice(0, 5)}`.trim();
}

function formatDuration(minutes?: number | null) {
  const value = Number(minutes || 0);
  if (value <= 0) return "Duracion pendiente";
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return mins ? `${hours} h ${mins} min` : `${hours} h`;
}

function getScheduleSummary(
  schedule?: Record<string, any> | null,
): { primary: string; secondary: string } {
  if (!schedule || typeof schedule !== "object") {
    return {
      primary: "Horario pendiente",
      secondary: "Sin configuracion de calendario",
    };
  }

  const typed = schedule as HorarioConfiguracionSalida;

  if (typed.tipo === "UNICA") {
    const inicio = typed.inicio;
    const fin = typed.finCalculado;
    const fecha = formatDate(inicio?.fecha);
    const inicioHora = inicio?.hora || formatDateTimeLocal(inicio?.fechaHoraLocal);
    const finHora = fin?.hora || formatDateTimeLocal(fin?.fechaHoraLocal);

    return {
      primary: [fecha, inicioHora].filter(Boolean).join(" · ") || "Salida unica",
      secondary: finHora
        ? `Llegada estimada ${fin?.fecha ? `${formatDate(fin.fecha)} ` : ""}${finHora}`
        : formatDuration(typed.duracionMin),
    };
  }

  if (typed.tipo === "RECURRENTE") {
    const days = typed.dias ?? [];
    const dayLabels = days
      .map((day) => DAY_LABELS[String(day.dia).toUpperCase()] || titleCase(String(day.dia)))
      .join(", ");
    const totalTimes = days.reduce((sum, day) => sum + (day.horarios?.length ?? 0), 0);

    return {
      primary: dayLabels || "Ciclo semanal",
      secondary: `${totalTimes} horario${totalTimes === 1 ? "" : "s"} · ${formatDuration(typed.duracionMin)}`,
    };
  }

  if (typed.tipo === "ESPECIAL") {
    const occurrences = typed.ocurrencias ?? [];
    const first = occurrences[0];
    return {
      primary: `${occurrences.length} fecha${occurrences.length === 1 ? "" : "s"} especial${occurrences.length === 1 ? "" : "es"}`,
      secondary: first
        ? `Primera: ${formatDate(first.fecha)} · ${first.horaInicio}`
        : formatDuration(typed.duracionMin),
    };
  }

  return {
    primary: schedule.fechaHoraLocal
      ? formatDateTimeLocal(schedule.fechaHoraLocal)
      : "Horario configurado",
    secondary: formatDuration(schedule.duracionMin),
  };
}

function getRoutePrice(salida: SalidaDetalle, rutaId: number) {
  const routes = Array.isArray(salida.precios?.rutas) ? salida.precios.rutas : [];
  const found = routes.find((item: any) => Number(item.rutaId) === Number(rutaId));
  return Number(found?.precio ?? 0);
}

function getRouteLabel(route: NonNullable<SalidaDetalle["viajeBase"]>["rutas"][number]) {
  if (route.nombre) return route.nombre;
  return `${formatPlaceShort(route.origen, "Origen")} - ${formatPlaceShort(route.destino, "Destino")}`;
}

function getBusTitle(salida: SalidaDetalle) {
  const bus = salida.autobus;
  return (
    bus?.alias ||
    bus?.codigo_interno ||
    [bus?.marca, bus?.modelo].filter(Boolean).join(" ") ||
    "Autobus sin nombre disponible"
  );
}

function getBusSubtitle(salida: SalidaDetalle) {
  const bus = salida.autobus;
  return (
    [bus?.marca, bus?.modelo].filter(Boolean).join(" ") ||
    salida.tipoAutobus?.nombre ||
    "Modelo pendiente"
  );
}

function getBusOptionLabel(bus: AutobusResumen) {
  const identity = bus.alias || bus.codigo_interno || "Autobus";
  const model = [bus.marca, bus.modelo].filter(Boolean).join(" ");
  return model ? `${identity} - ${model}` : identity;
}

function StatCard({
  title,
  subtitle,
  value,
  color,
}: Readonly<{
  title: string;
  subtitle: string;
  value: string | number;
  color: string;
}>) {
  return (
    <PaperBlock
      paperProps={{
        sx: {
          alignItems: "stretch",
          minHeight: 108,
          borderLeft: `4px solid ${color}`,
        },
      }}
    >
      <Stack spacing={0.5}>
        <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 950, color }}>
          {value}
        </Typography>
      </Stack>
    </PaperBlock>
  );
}

function InfoLine({
  icon,
  label,
  value,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}>) {
  return (
    <Stack direction="row" spacing={1} sx={{ minWidth: 0, alignItems: "flex-start" }}>
      <Box sx={{ color: "text.secondary", display: "grid", pt: 0.15 }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 650,
            overflowWrap: "anywhere",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function RouteList({ salida }: Readonly<{ salida: SalidaDetalle }>) {
  const routes = salida.viajeBase?.rutas ?? [];

  if (routes.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sin rutas configuradas
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {routes.map((route, index) => (
        <Box
          key={`${salida.id}-${route.id}`}
          sx={{
            display: "grid",
            gridTemplateColumns: "28px minmax(0, 1fr) auto",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "grid",
              placeItems: "center",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {index + 1}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Tooltip title={getRouteLabel(route)}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {getRouteLabel(route)}
              </Typography>
            </Tooltip>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {formatPlaceShort(route.origen, "Origen")} - {formatPlaceShort(route.destino, "Destino")}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 900, color: "primary.main" }}>
            {formatCurrency(getRoutePrice(salida, route.rutaId))}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

function SalidaCard({
  salida,
  canReassign,
  canCancel,
  cancelingId,
  onCancel,
  onReassign,
}: Readonly<{
  salida: SalidaDetalle;
  canReassign: boolean;
  canCancel: boolean;
  cancelingId: number | null;
  onCancel: (id: number) => void;
  onReassign: (salida: SalidaDetalle) => void;
}>) {
  const status = STATUS_META[salida.estadoSalida] ?? STATUS_META.PROGRAMADO;
  const schedule = getScheduleSummary(salida.horario_configuracion);
  const routes = salida.viajeBase?.rutas ?? [];
  const capacity = Number(salida.capacidadTotal ?? 0);
  const available = Number(salida.asientosDisponibles ?? 0);
  const occupied = capacity > 0 ? capacity - available : 0;
  const occupancy = capacity > 0 ? Math.max(0, Math.min(100, (occupied / capacity) * 100)) : 0;

  return (
    <PaperBlock
      paperProps={{
        sx: {
          p: 0,
          alignItems: "stretch",
          borderLeft: `5px solid ${status.accent}`,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", lg: "flex-start" } }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.75, mb: 0.75 }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
                Salida #{salida.id}
              </Typography>
              <Chip size="small" label={status.label} color={status.color} sx={{ fontWeight: 900 }} />
              <Chip
                size="small"
                variant="outlined"
                icon={<EventRepeatIcon />}
                label={TYPE_LABELS[salida.tipoSalida] ?? salida.tipoSalida}
              />
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 950, lineHeight: 1.15 }}>
              {salida.viajeBase?.nombre || "Viaje base sin nombre"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {schedule.primary}
            </Typography>
          </Box>

          <Box
            sx={{
              textAlign: { xs: "left", lg: "right" },
              minWidth: { xs: "auto", lg: 180 },
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
              Total base
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 950, color: "primary.main" }}>
              {formatCurrency(salida.precio)}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 1.75 }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.15fr) minmax(320px, 0.85fr)" },
            gap: 2,
          }}
        >
          <Stack spacing={1.4}>
            <InfoLine
              icon={<AccessTimeIcon fontSize="small" />}
              label="Horario"
              value={schedule.secondary}
            />
            <InfoLine
              icon={<DirectionsBusIcon fontSize="small" />}
              label="Autobus"
              value={`${getBusTitle(salida)} · ${getBusSubtitle(salida)}`}
            />
            <InfoLine
              icon={<PersonIcon fontSize="small" />}
              label="Conductor"
              value={salida.conductor?.nombre || "Conductor sin nombre disponible"}
            />
            <InfoLine
              icon={<LocationOnIcon fontSize="small" />}
              label="Origen"
              value={formatPlace(salida.lugarSalida, "Origen pendiente")}
            />
            <InfoLine
              icon={<LocationOnIcon fontSize="small" />}
              label="Destino"
              value={formatPlace(salida.lugarLlegada, "Destino pendiente")}
            />
          </Stack>

          <Stack spacing={1.5}>
            <Box
              sx={{
                p: 1.25,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                <RouteIcon color="primary" fontSize="small" />
                <Typography sx={{ fontWeight: 900 }}>
                  {routes.length} ruta{routes.length === 1 ? "" : "s"}
                </Typography>
              </Stack>
              <RouteList salida={salida} />
            </Box>

            <Box
              sx={{
                p: 1.25,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75 }}>
                <AirlineSeatReclineNormalIcon color="primary" fontSize="small" />
                <Typography sx={{ fontWeight: 900 }}>Ocupacion</Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: "baseline", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  {capacity > 0 ? `${available}/${capacity} lugares disponibles` : "Capacidad pendiente"}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 900 }}>
                  {Math.round(occupancy)}%
                </Typography>
              </Stack>
              <Box
                sx={{
                  mt: 0.8,
                  height: 8,
                  borderRadius: 999,
                  bgcolor: "action.hover",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${occupancy}%`,
                    bgcolor: status.accent,
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ justifyContent: "flex-end", mt: 2 }}
        >
          {canReassign ? (
            <Button
              variant="outlined"
              onClick={() => onReassign(salida)}
              disabled={salida.estadoSalida === "CANCELADO"}
            >
              Reasignar
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              disabled={salida.estadoSalida === "CANCELADO" || cancelingId === salida.id}
              onClick={() => onCancel(salida.id)}
            >
              {cancelingId === salida.id ? "Cancelando..." : "Cancelar salida"}
            </Button>
          ) : null}
        </Stack>
      </Box>
    </PaperBlock>
  );
}

export default function SalidasIndex({
  snack,
  navigationFunction,
  userPrivileges = [],
  userRoles = [],
}: Readonly<Props>) {
  const canCreate = hasPrivilege(userPrivileges, userRoles, "viaje:abrir");
  const canReassign = hasPrivilege(userPrivileges, userRoles, "salida:reasignar");
  const canCancel = hasPrivilege(userPrivileges, userRoles, "salida:cancelar");
  const isConductor = userRoles.includes("ROLE_CONDUCTOR");
  const [salidas, setSalidas] = React.useState<SalidaDetalle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [cancelingId, setCancelingId] = React.useState<number | null>(null);
  const [reassigningId, setReassigningId] = React.useState<number | null>(null);
  const [reassignData, setReassignData] = React.useState({ autobusId: "", conductorId: "" });
  const [reassignOpen, setReassignOpen] = React.useState(false);
  const [reassignAutobuses, setReassignAutobuses] = React.useState<AutobusResumen[]>([]);
  const [reassignConductores, setReassignConductores] = React.useState<ConductorResumen[]>([]);
  const [reassignOptionsLoading, setReassignOptionsLoading] = React.useState(false);
  const [reassignOptionsError, setReassignOptionsError] = React.useState("");
  const [estadoFilter, setEstadoFilter] = React.useState<EstadoSalida | "TODOS">("TODOS");
  const [tipoFilter, setTipoFilter] = React.useState<TipoSalida | "TODOS">("TODOS");
  const [search, setSearch] = React.useState("");

  const loadSalidas = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSalidas();
      setSalidas(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las salidas.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSalidas();
  }, [loadSalidas]);

  const handleCancel = React.useCallback(
    async (id: number) => {
      setCancelingId(id);
      try {
        await cancelSalida(id);
        snack?.success?.({ message: "Salida cancelada correctamente." });
        await loadSalidas();
      } catch (err) {
        snack?.error?.({
          message:
            err instanceof Error
              ? `No se pudo cancelar la salida: ${err.message}`
              : "No se pudo cancelar la salida.",
        });
      } finally {
        setCancelingId(null);
      }
    },
    [loadSalidas, snack],
  );

  const openReassign = React.useCallback(async (salida: SalidaDetalle) => {
    setReassigningId(salida.id);
    setReassignData({
      autobusId: String(salida.autobusId ?? ""),
      conductorId: String(salida.conductorId ?? ""),
    });
    setReassignOpen(true);
    setReassignOptionsLoading(true);
    setReassignOptionsError("");
    setReassignAutobuses([]);
    setReassignConductores([]);

    try {
      const institucionId = salida.institucion?.id ?? undefined;
      const [autobuses, conductores] = await Promise.all([
        getActiveAutobuses(institucionId),
        getActiveConductores(institucionId),
      ]);
      setReassignAutobuses(autobuses);
      setReassignConductores(conductores);
    } catch (err) {
      setReassignOptionsError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar autobuses y conductores.",
      );
    } finally {
      setReassignOptionsLoading(false);
    }
  }, []);

  const handleReassign = React.useCallback(async () => {
    if (!reassigningId) return;

    const autobusId = Number(reassignData.autobusId);
    const conductorId = Number(reassignData.conductorId);

    if (!autobusId || !conductorId) {
      snack?.error?.({ message: "Debes indicar un autobus y un conductor validos." });
      return;
    }

    setReassigningId(reassigningId);
    try {
      await updateSalida(reassigningId, {
        autobusId,
        conductorId,
      });
      snack?.success?.({ message: "Salida reasignada correctamente." });
      setReassignOpen(false);
      await loadSalidas();
    } catch (err) {
      snack?.error?.({
        message:
          err instanceof Error
            ? `No se pudo reasignar la salida: ${err.message}`
            : "No se pudo reasignar la salida.",
      });
    } finally {
      setReassigningId(null);
    }
  }, [loadSalidas, reassignData, reassigningId, snack]);

  const filteredSalidas = React.useMemo(() => {
    const term = search.trim().toLowerCase();

    return salidas.filter((salida) => {
      const matchesStatus =
        estadoFilter === "TODOS" || salida.estadoSalida === estadoFilter;
      const matchesType = tipoFilter === "TODOS" || salida.tipoSalida === tipoFilter;
      const haystack = [
        salida.id,
        salida.viajeBase?.nombre,
        salida.viajeBase?.descripcion,
        getBusTitle(salida),
        getBusSubtitle(salida),
        formatPlace(salida.lugarSalida, ""),
        formatPlace(salida.lugarLlegada, ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && matchesType && (!term || haystack.includes(term));
    });
  }, [estadoFilter, salidas, search, tipoFilter]);

  const total = salidas.length;
  const programadas = salidas.filter((s) => s.estadoSalida === "PROGRAMADO").length;
  const enCurso = salidas.filter((s) => s.estadoSalida === "EN_CURSO").length;
  const canceladas = salidas.filter((s) => s.estadoSalida === "CANCELADO").length;
  const selectedReassignSalida = salidas.find(
    (salida) => salida.id === reassigningId,
  );

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[{ nombre: "Salidas", href: "/dashboard/salidas", disabled: true }]}
      />

      <PaperHeader
        title="Salidas"
        subtitle="Listado operativo de salidas programadas, activas y canceladas"
        iconname="event_available"
        showButton
        onButtonClick={() => navigationFunction?.("/dashboard/salidas/programacion")}
        buttonTitle="Programar salida"
        buttonDisabled={!canCreate}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(4, minmax(0, 1fr))" },
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <StatCard title="Total" subtitle="Registros cargados" value={total} color="#0f172a" />
        <StatCard title="Programadas" subtitle="Pendientes por ejecutar" value={programadas} color="#f97316" />
        <StatCard title="En curso" subtitle="Actualmente activas" value={enCurso} color="#16a34a" />
        <StatCard title="Canceladas" subtitle="Eventos anulados" value={canceladas} color="#dc2626" />
      </Box>

      <PaperBlock
        paperProps={{ sx: { alignItems: "stretch", mb: 1.5 } }}
        contentWrapperSx={{ mt: -0.5 }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(260px, 1fr) 220px 220px" },
            gap: 1.25,
            alignItems: "center",
          }}
        >
          <TextField
            label="Buscar salida"
            placeholder="Viaje, autobus, origen o destino"
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
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
          <TextField
            label="Estado"
            select
            size="small"
            value={estadoFilter}
            onChange={(event) => setEstadoFilter(event.target.value as EstadoSalida | "TODOS")}
          >
            <MenuItem value="TODOS">Todos los estados</MenuItem>
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <MenuItem key={key} value={key}>
                {meta.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Tipo"
            select
            size="small"
            value={tipoFilter}
            onChange={(event) => setTipoFilter(event.target.value as TipoSalida | "TODOS")}
          >
            <MenuItem value="TODOS">Todos los tipos</MenuItem>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </PaperBlock>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : null}

      {loading ? (
        <PaperBlock title="Cargando salidas" subtitle="Consultando informacion activa">
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <CircularProgress size={22} />
            <Typography>Cargando...</Typography>
          </Stack>
        </PaperBlock>
      ) : salidas.length === 0 ? (
        <PaperBlock
          title={isConductor ? "Sin salidas asignadas" : "Sin salidas"}
          subtitle={
            isConductor
              ? "No tienes salidas asignadas actualmente"
              : "Todavia no hay salidas registradas"
          }
        >
          {canCreate ? (
            <Button variant="contained" onClick={() => navigationFunction?.("/dashboard/salidas/programacion")}>
              Programar primera salida
            </Button>
          ) : null}
        </PaperBlock>
      ) : filteredSalidas.length === 0 ? (
        <PaperBlock title="Sin resultados" subtitle="Ajusta la busqueda o los filtros">
          <Button
            startIcon={<FilterAltIcon />}
            onClick={() => {
              setSearch("");
              setEstadoFilter("TODOS");
              setTipoFilter("TODOS");
            }}
          >
            Limpiar filtros
          </Button>
        </PaperBlock>
      ) : (
        <Stack spacing={1.5}>
          {filteredSalidas.map((salida) => (
            <SalidaCard
              key={salida.id}
              salida={salida}
              canReassign={canReassign}
              canCancel={canCancel}
              cancelingId={cancelingId}
              onCancel={(id) => void handleCancel(id)}
              onReassign={openReassign}
            />
          ))}
        </Stack>
      )}

      <Dialog open={reassignOpen} onClose={() => setReassignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reasignar salida</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Autobus"
              select
              value={reassignData.autobusId}
              onChange={(event) =>
                setReassignData((prev) => ({ ...prev, autobusId: event.target.value }))
              }
              disabled={reassignOptionsLoading}
              fullWidth
            >
              <MenuItem value="">Selecciona un autobus</MenuItem>
              {reassignData.autobusId &&
              !reassignAutobuses.some(
                (bus) => String(bus.id) === reassignData.autobusId,
              ) ? (
                <MenuItem value={reassignData.autobusId}>
                  {selectedReassignSalida
                    ? `${getBusTitle(selectedReassignSalida)} (actual)`
                    : "Autobus actual"}
                </MenuItem>
              ) : null}
              {reassignAutobuses.map((bus) => (
                <MenuItem key={bus.id} value={String(bus.id)}>
                  {getBusOptionLabel(bus)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Conductor"
              select
              value={reassignData.conductorId}
              onChange={(event) =>
                setReassignData((prev) => ({ ...prev, conductorId: event.target.value }))
              }
              disabled={reassignOptionsLoading}
              fullWidth
            >
              <MenuItem value="">Selecciona un conductor</MenuItem>
              {reassignData.conductorId &&
              !reassignConductores.some(
                (driver) => String(driver.id) === reassignData.conductorId,
              ) ? (
                <MenuItem value={reassignData.conductorId}>
                  {selectedReassignSalida?.conductor?.nombre
                    ? `${selectedReassignSalida.conductor.nombre} (actual)`
                    : "Conductor actual"}
                </MenuItem>
              ) : null}
              {reassignConductores.map((driver) => (
                <MenuItem key={driver.id} value={String(driver.id)}>
                  {fullDriverName(driver)}
                </MenuItem>
              ))}
            </TextField>
            {reassignOptionsLoading ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <CircularProgress size={18} />
                <Typography variant="body2">Cargando opciones...</Typography>
              </Stack>
            ) : null}
            {reassignOptionsError ? (
              <Alert severity="error">{reassignOptionsError}</Alert>
            ) : null}
            <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
              <Button onClick={() => setReassignOpen(false)}>Cancelar</Button>
              <Button
                variant="contained"
                startIcon={<PaymentsIcon />}
                disabled={reassignOptionsLoading || Boolean(reassignOptionsError)}
                onClick={() => void handleReassign()}
              >
                Guardar reasignacion
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
