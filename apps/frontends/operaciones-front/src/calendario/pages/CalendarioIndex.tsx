"use client";

import React from "react";
import {
  Breadcrumb,
  CommonPageProps,
  PaperHeader,
} from "@nexoroute/commons";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CircleIcon from "@mui/icons-material/Circle";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import EventNoteIcon from "@mui/icons-material/EventNote";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import TodayIcon from "@mui/icons-material/Today";
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
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { getCalendarioMes } from "../api/calendarioHttp";
import {
  CalendarioDia,
  CalendarioMesResponse,
  CalendarioViajeItem,
} from "../types/CalendarioApi";
import { EstadoSalida } from "../../salidas/types/SalidasApi";

interface Props extends CommonPageProps {}

const WEEK_DAYS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

const STATUS_LABELS: Record<EstadoSalida, string> = {
  PROGRAMADO: "Programado",
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

const STATUS_COLORS: Record<EstadoSalida, string> = {
  PROGRAMADO: "#2563eb",
  EN_CURSO: "#16a34a",
  FINALIZADO: "#64748b",
  CANCELADO: "#dc2626",
};

function getCurrentMonth() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

function shiftMonth(current: { year: number; month: number }, delta: number) {
  const next = new Date(current.year, current.month - 1 + delta, 1);
  return {
    year: next.getFullYear(),
    month: next.getMonth() + 1,
  };
}

function formatRange(data: CalendarioMesResponse | null) {
  if (!data) return "";
  const start = new Date(data.year, data.month - 1, 1);
  const end = new Date(data.year, data.month, 0);
  const formatter = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function formatTripTime(item: CalendarioViajeItem) {
  if (!item.horaSalida) return "Sin hora";
  return item.horaLlegada ? `${item.horaSalida} - ${item.horaLlegada}` : item.horaSalida;
}

function StatusDots({ items }: Readonly<{ items: CalendarioViajeItem[] }>) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ minHeight: 16, flexWrap: "wrap", rowGap: 0.5 }}>
      {items.slice(0, 4).map((item, index) => (
        <Tooltip
          key={`${item.salidaId}-${item.fecha}-${item.horaSalida ?? index}`}
          title={`${STATUS_LABELS[item.estadoSalida]} - ${item.viajeNombre}`}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: STATUS_COLORS[item.estadoSalida],
              boxShadow: `0 0 0 2px ${STATUS_COLORS[item.estadoSalida]}22`,
            }}
          />
        </Tooltip>
      ))}
    </Stack>
  );
}

function DayCell({
  day,
  onClick,
}: Readonly<{
  day: CalendarioDia;
  onClick: (day: CalendarioDia) => void;
}>) {
  const visibleItems = day.items.slice(0, 2);
  const hidden = Math.max(0, day.items.length - visibleItems.length);

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onClick(day)}
      sx={(theme) => ({
        border: 0,
        borderRight: "1px solid",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: day.isToday ? "rgba(37,99,235,0.06)" : "background.paper",
        color: day.isCurrentMonth ? "text.primary" : "text.disabled",
        cursor: "pointer",
        height: { xs: 124, md: 142 },
        minHeight: { xs: 124, md: 142 },
        p: 1,
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        overflow: "hidden",
        transition: "background-color 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.04)",
          boxShadow: "inset 0 0 0 1px rgba(37,99,235,0.38)",
        },
      })}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography
          sx={{
            fontWeight: day.isToday ? 950 : 850,
            width: day.isToday ? 28 : "auto",
            height: day.isToday ? 28 : "auto",
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            bgcolor: day.isToday ? "primary.main" : "transparent",
            color: day.isToday ? "primary.contrastText" : "inherit",
          }}
        >
          {day.day}
        </Typography>
        {day.total > 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
            {day.total}
          </Typography>
        ) : null}
      </Stack>

      <StatusDots items={day.items} />

      <Stack spacing={0.4} sx={{ minWidth: 0 }}>
        {visibleItems.map((item) => (
          <Stack
            key={`${item.salidaId}-${item.fecha}-${item.horaSalida ?? item.estadoSalida}`}
            direction="row"
            spacing={0.75}
            sx={{ minWidth: 0, alignItems: "center" }}
          >
            <CircleIcon sx={{ fontSize: 8, color: STATUS_COLORS[item.estadoSalida] }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 750,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.horaSalida ?? "--:--"} {item.viajeNombre}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {hidden > 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: "auto", fontWeight: 850 }}>
          +{hidden} mas
        </Typography>
      ) : null}
    </Box>
  );
}

function TripRow({ item }: Readonly<{ item: CalendarioViajeItem }>) {
  return (
    <Box
      sx={{
        p: 1.25,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "8px",
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} sx={{ mb: 0.5, alignItems: "center" }}>
            <CircleIcon sx={{ fontSize: 10, color: STATUS_COLORS[item.estadoSalida] }} />
            <Typography sx={{ fontWeight: 950 }}>{item.viajeNombre}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {item.origen || "Origen pendiente"} - {item.destino || "Destino pendiente"}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={STATUS_LABELS[item.estadoSalida]}
          sx={{
            bgcolor: `${STATUS_COLORS[item.estadoSalida]}18`,
            color: STATUS_COLORS[item.estadoSalida],
            fontWeight: 900,
          }}
        />
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
      >
        <Chip icon={<TodayIcon />} label={formatTripTime(item)} size="small" variant="outlined" />
        <Chip icon={<DirectionsBusIcon />} label={`Bus ${item.autobusId}`} size="small" variant="outlined" />
        <Chip
          label={`${item.asientosDisponibles}/${item.capacidadTotal} lugares`}
          size="small"
          variant="outlined"
        />
      </Stack>
    </Box>
  );
}

export default function CalendarioIndex({
  navigationFunction,
}: Readonly<Props>) {
  const theme = useTheme();
  const [cursor, setCursor] = React.useState(getCurrentMonth);
  const [estadoSalida, setEstadoSalida] = React.useState<EstadoSalida | "TODOS">("TODOS");
  const [data, setData] = React.useState<CalendarioMesResponse | null>(null);
  const [selectedDay, setSelectedDay] = React.useState<CalendarioDia | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const loadCalendar = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getCalendarioMes({
        year: cursor.year,
        month: cursor.month,
        filters: { estadoSalida },
      });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el calendario.");
    } finally {
      setLoading(false);
    }
  }, [cursor, estadoSalida]);

  React.useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[{ nombre: "Calendario", href: "/dashboard/calendar", disabled: true }]}
      />

      <PaperHeader
        title="Calendario de viajes"
        subtitle={data ? `${data.monthLabel} ${data.year} - ${data.totalEventos} viajes` : "Viajes programados por mes"}
        iconname="calendar_month"
        showButton
        buttonTitle="Programar salida"
        onButtonClick={() => navigationFunction?.("/dashboard/salidas/programacion")}
      />

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "8px",
          overflow: "hidden",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) auto" },
            gap: 1.5,
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ minWidth: 0, flexWrap: "wrap", rowGap: 1, alignItems: "center" }}>
            <Box
              sx={{
                width: 76,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                overflow: "hidden",
                textAlign: "center",
                flex: "0 0 auto",
              }}
            >
              <Typography sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 950, py: 0.5 }}>
                {data?.monthLabel.slice(0, 3).toUpperCase() ?? "---"}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 950, py: 0.6 }}>
                {new Date().getDate()}
              </Typography>
            </Box>

            <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 0.75, alignItems: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: 950 }}>
                  {data ? `${data.monthLabel} ${data.year}` : "Calendario"}
                </Typography>
                <Chip label={`${data?.totalEventos ?? 0} viajes`} size="small" sx={{ fontWeight: 900 }} />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Tooltip title="Mes anterior">
                  <IconButton onClick={() => setCursor((current) => shiftMonth(current, -1))}>
                    <ChevronLeftIcon />
                  </IconButton>
                </Tooltip>
                <Typography color="text.secondary" sx={{ fontWeight: 800 }}>
                  {formatRange(data)}
                </Typography>
                <Tooltip title="Mes siguiente">
                  <IconButton onClick={() => setCursor((current) => shiftMonth(current, 1))}>
                    <ChevronRightIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              justifyContent: { xs: "flex-start", lg: "flex-end" },
            }}
          >
            <TextField
              select
              size="small"
              value={estadoSalida}
              onChange={(event) => setEstadoSalida(event.target.value as EstadoSalida | "TODOS")}
              sx={{ width: 190 }}
              slotProps={{
                input: {
                  startAdornment: <FilterAltIcon fontSize="small" sx={{ mr: 0.75, color: "text.secondary" }} />,
                },
              }}
            >
              <MenuItem value="TODOS">Todos</MenuItem>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" startIcon={<TodayIcon />} onClick={() => setCursor(getCurrentMonth())}>
              Hoy
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigationFunction?.("/dashboard/salidas/programacion")}
            >
              Nueva salida
            </Button>
          </Stack>
        </Box>

        {error ? <Alert severity="error" sx={{ m: 2 }}>{error}</Alert> : null}

        {loading ? (
          <Box sx={{ minHeight: 420, display: "grid", placeItems: "center" }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <CircularProgress size={24} />
              <Typography>Cargando calendario...</Typography>
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              overflow: "auto",
              maxHeight: {
                xs: "calc(100dvh - 370px)",
                md: "calc(100dvh - 330px)",
              },
              minHeight: { xs: 420, md: 500 },
              overscrollBehavior: "contain",
              scrollbarGutter: "stable",
              "&::-webkit-scrollbar": {
                width: 10,
                height: 10,
              },
              "&::-webkit-scrollbar-track": {
                bgcolor: "rgba(15,23,42,0.06)",
              },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(15,23,42,0.28)",
                borderRadius: 999,
                border: "2px solid transparent",
                backgroundClip: "content-box",
              },
            }}
          >
            <Box sx={{ minWidth: 900 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                }}
              >
                {WEEK_DAYS.map((day) => (
                  <Box
                    key={day}
                    sx={{
                      p: 1,
                      textAlign: "center",
                      borderRight: "1px solid",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)",
                    }}
                  >
                    <Typography color="text.secondary" sx={{ fontWeight: 900 }}>
                      {day}
                    </Typography>
                  </Box>
                ))}
              </Box>
              {data?.weeks.map((week) => (
                <Box
                  key={week.weekIndex}
                  sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
                >
                  {week.days.map((day) => (
                    <DayCell key={day.date} day={day} onClick={setSelectedDay} />
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      <Dialog open={Boolean(selectedDay)} onClose={() => setSelectedDay(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <EventNoteIcon color="primary" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 950 }}>
                {selectedDay?.date ?? ""}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedDay?.total ?? 0} viajes
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedDay?.items.length ? (
            <Stack spacing={1.25} sx={{ py: 1 }}>
              {selectedDay.items.map((item, index) => (
                <TripRow key={`${item.salidaId}-${item.fecha}-${item.horaSalida ?? index}`} item={item} />
              ))}
            </Stack>
          ) : (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Sin viajes programados
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                startIcon={<AddIcon />}
                onClick={() => navigationFunction?.("/dashboard/salidas/programacion")}
              >
                Programar salida
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
