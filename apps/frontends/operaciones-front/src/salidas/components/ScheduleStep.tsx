"use client";

import React from "react";
import { PaperBlock } from "@nexoroute/commons";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import EventIcon from "@mui/icons-material/Event";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { TipoSalida } from "../types/SalidasApi";
import CalendarDateField from "./CalendarDateField";
import {
  RecurringSchedule,
  SingleSchedule,
  SpecialOccurrence,
  WEEK_DAYS,
  addMinutesToLocal,
  formatDateTime,
} from "../utils/schedule";
import { formatDuration } from "../utils/formatters";

const TYPE_OPTIONS: Array<{
  value: TipoSalida;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}> = [
  {
    value: "UNICA",
    title: "Unica",
    subtitle: "Una sola salida con llegada calculada.",
    icon: <LooksOneIcon />,
  },
  {
    value: "RECURRENTE",
    title: "Recurrente",
    subtitle: "Dias de la semana con uno o varios horarios.",
    icon: <EventRepeatIcon />,
  },
  {
    value: "ESPECIAL",
    title: "Especial",
    subtitle: "Varias fechas puntuales, sin repeticion semanal.",
    icon: <EventIcon />,
  },
];

function TypeCard({
  active,
  title,
  subtitle,
  icon,
  onClick,
}: Readonly<{
  active: boolean;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick: () => void;
}>) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        p: 1,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: active ? "primary.main" : "divider",
        bgcolor: active ? "rgba(31,97,141,0.07)" : "background.paper",
        color: active ? "primary.main" : "text.primary",
        display: "grid",
        gridTemplateColumns: "36px minmax(0, 1fr)",
        gap: 1,
        textAlign: "left",
        cursor: "pointer",
        minHeight: 74,
      }}
    >
      <Box sx={{ display: "grid", placeItems: "center" }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}

function createEmptyRecurring(): RecurringSchedule {
  return WEEK_DAYS.reduce<RecurringSchedule>((acc, day) => {
    acc[day.key] = [];
    return acc;
  }, {});
}

function createEmptySpecial(): SpecialOccurrence[] {
  return [{ id: `special-${Date.now()}`, fecha: "", hora: "" }];
}

function hasConfiguredValue(
  tipo: TipoSalida,
  single: SingleSchedule,
  recurring: RecurringSchedule,
  special: SpecialOccurrence[],
) {
  if (tipo === "UNICA") return Boolean(single.fecha || single.hora);
  if (tipo === "RECURRENTE") {
    return Object.values(recurring).some((times) => times.length > 0);
  }
  return special.some((item) => item.fecha || item.hora);
}

function ArrivalBox({
  fecha,
  hora,
  durationMin,
}: Readonly<{
  fecha: string;
  hora: string;
  durationMin: number;
}>) {
  const arrival = addMinutesToLocal(fecha, hora, durationMin);

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "rgba(31,97,141,0.06)",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Llegada estimada
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 950, color: "primary.main" }}>
        {formatDateTime(arrival.fecha, arrival.hora)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Calculado con duracion de viaje: {formatDuration(durationMin)}
      </Typography>
    </Box>
  );
}

export default function ScheduleStep({
  tipoSalida,
  onTipoSalidaChange,
  single,
  onSingleChange,
  recurring,
  onRecurringChange,
  special,
  onSpecialChange,
  durationMin,
}: Readonly<{
  tipoSalida: TipoSalida;
  onTipoSalidaChange: (value: TipoSalida) => void;
  single: SingleSchedule;
  onSingleChange: (value: SingleSchedule) => void;
  recurring: RecurringSchedule;
  onRecurringChange: (value: RecurringSchedule) => void;
  special: SpecialOccurrence[];
  onSpecialChange: (value: SpecialOccurrence[]) => void;
  durationMin: number;
}>) {
  const [selectedDay, setSelectedDay] = React.useState<string>(WEEK_DAYS[0].key);
  const [newRecurringTime, setNewRecurringTime] = React.useState("");
  const [pendingType, setPendingType] = React.useState<TipoSalida | null>(null);

  const applyTypeChange = (nextType: TipoSalida) => {
    onSingleChange({ fecha: "", hora: "" });
    onRecurringChange(createEmptyRecurring());
    onSpecialChange(createEmptySpecial());
    setNewRecurringTime("");
    onTipoSalidaChange(nextType);
  };

  const requestTypeChange = (nextType: TipoSalida) => {
    if (nextType === tipoSalida) return;
    if (hasConfiguredValue(tipoSalida, single, recurring, special)) {
      setPendingType(nextType);
      return;
    }
    applyTypeChange(nextType);
  };

  const addRecurringTime = () => {
    if (!newRecurringTime) return;
    const current = recurring[selectedDay] || [];
    if (current.includes(newRecurringTime)) {
      setNewRecurringTime("");
      return;
    }
    onRecurringChange({
      ...recurring,
      [selectedDay]: [...current, newRecurringTime].sort(),
    });
    setNewRecurringTime("");
  };

  const removeRecurringTime = (day: string, time: string) => {
    onRecurringChange({
      ...recurring,
      [day]: (recurring[day] || []).filter((item) => item !== time),
    });
  };

  const addSpecial = () => {
    onSpecialChange([
      ...special,
      { id: `${Date.now()}-${special.length}`, fecha: "", hora: "" },
    ]);
  };

  const updateSpecial = (
    id: string,
    patch: Partial<Pick<SpecialOccurrence, "fecha" | "hora">>,
  ) => {
    onSpecialChange(
      special.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  return (
    <PaperBlock
      title="Paso 3 - Fecha y hora"
      subtitle="Define si la salida es unica, recurrente o especial. La llegada se calcula con la duracion del viaje."
      contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.25 }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(3, minmax(0, 1fr))" },
          gap: 1,
        }}
      >
        {TYPE_OPTIONS.map((option) => (
          <TypeCard
            key={option.value}
            active={tipoSalida === option.value}
            title={option.title}
            subtitle={option.subtitle}
            icon={option.icon}
            onClick={() => requestTypeChange(option.value)}
          />
        ))}
      </Box>

      {tipoSalida === "UNICA" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.1fr) 360px" },
            gap: 1.25,
            alignItems: "stretch",
          }}
        >
          <Box
            sx={{
              p: 1.25,
              borderRadius: "8px",
              border: "1px solid",
              borderColor: "divider",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 1.25,
              alignContent: "start",
            }}
          >
            <Box>
              <CalendarDateField
                label="Fecha de inicio"
                value={single.fecha}
                onChange={(fecha) => onSingleChange({ ...single, fecha })}
              />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 900, mb: 0.75 }}>
                Hora de inicio
              </Typography>
              <TextField
                type="time"
                value={single.hora}
                onChange={(event) => onSingleChange({ ...single, hora: event.target.value })}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
          </Box>
          <ArrivalBox fecha={single.fecha} hora={single.hora} durationMin={durationMin} />
        </Box>
      )}

      {tipoSalida === "RECURRENTE" && (
        <Stack spacing={1.5}>
          <Alert severity="info">
            Usa este modo para ciclos semanales: por ejemplo lunes 08:00 y 10:00, martes 07:00 y 09:00.
          </Alert>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", rowGap: 0.75 }}>
            {WEEK_DAYS.map((day) => {
              const count = recurring[day.key]?.length || 0;
              return (
                <Chip
                  key={day.key}
                  label={`${day.short} ${count ? `(${count})` : ""}`}
                  color={selectedDay === day.key ? "primary" : "default"}
                  onClick={() => setSelectedDay(day.key)}
                  sx={{ fontWeight: 900 }}
                />
              );
            })}
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "220px auto" },
              gap: 1,
              alignItems: "end",
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 900, mb: 0.75 }}>
                Hora para {WEEK_DAYS.find((day) => day.key === selectedDay)?.label}
              </Typography>
              <TextField
                type="time"
                value={newRecurringTime}
                onChange={(event) => setNewRecurringTime(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addRecurringTime}
              disabled={!newRecurringTime}
              sx={{ width: { xs: "100%", md: 180 } }}
            >
              Agregar
            </Button>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" }, gap: 1 }}>
            {WEEK_DAYS.map((day) => {
              const times = recurring[day.key] || [];
              return (
                <Box
                  key={day.key}
                  sx={{
                    p: 1.25,
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: times.length ? "primary.light" : "divider",
                    bgcolor: times.length ? "rgba(31,97,141,0.04)" : "background.paper",
                  }}
                >
                  <Typography sx={{ fontWeight: 950 }}>{day.label}</Typography>
                  {times.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      Sin horarios
                    </Typography>
                  ) : (
                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", mt: 1, rowGap: 0.75 }}>
                      {times.map((time) => {
                        const arrival = addMinutesToLocal("2026-01-05", time, durationMin);
                        return (
                          <Chip
                            key={time}
                            icon={<AccessTimeIcon />}
                            label={`${time} -> ${arrival.hora}`}
                            onDelete={() => removeRecurringTime(day.key, time)}
                          />
                        );
                      })}
                    </Stack>
                  )}
                </Box>
              );
            })}
          </Box>
        </Stack>
      )}

      {tipoSalida === "ESPECIAL" && (
        <Stack spacing={1.25}>
          <Alert severity="info">
            Usa este modo para salidas puntuales que se repiten pocas veces, sin crear un ciclo semanal.
          </Alert>
          {special.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                p: 1.25,
                borderRadius: "8px",
                border: "1px solid",
                borderColor: "divider",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "42px 1fr 1fr 1fr auto" },
                gap: 1,
                alignItems: "center",
              }}
            >
              <Chip label={index + 1} color="primary" sx={{ width: 38, fontWeight: 950 }} />
              <CalendarDateField
                label="Fecha de inicio"
                value={item.fecha}
                onChange={(fecha) => updateSpecial(item.id, { fecha })}
              />
              <TextField
                type="time"
                value={item.hora}
                onChange={(event) => updateSpecial(item.id, { hora: event.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <ArrivalBox fecha={item.fecha} hora={item.hora} durationMin={durationMin} />
              <IconButton
                aria-label="Quitar ocurrencia"
                onClick={() => onSpecialChange(special.filter((current) => current.id !== item.id))}
                disabled={special.length <= 1}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          ))}
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addSpecial} sx={{ alignSelf: "flex-start" }}>
            Agregar fecha especial
          </Button>
        </Stack>
      )}

      <Chip
        icon={<AccessTimeIcon />}
        label={`Duracion tomada del viaje: ${formatDuration(durationMin)}`}
        sx={{ justifyContent: "flex-start", alignSelf: "flex-start" }}
      />

      <Dialog open={Boolean(pendingType)} onClose={() => setPendingType(null)}>
        <DialogTitle>Cambiar tipo de salida</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Si cambias el tipo de salida se limpiara la configuracion capturada en este paso. Solo puede quedar activo un tipo de programacion.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingType(null)}>Cancelar</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              if (pendingType) applyTypeChange(pendingType);
              setPendingType(null);
            }}
          >
            Cambiar y limpiar
          </Button>
        </DialogActions>
      </Dialog>
    </PaperBlock>
  );
}
