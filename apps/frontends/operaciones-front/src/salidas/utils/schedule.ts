import {
  HorarioConfiguracionSalida,
  TipoSalida,
} from "../types/SalidasApi";

export type SingleSchedule = {
  fecha: string;
  hora: string;
};

export type RecurringSchedule = Record<string, string[]>;

export type SpecialOccurrence = {
  id: string;
  fecha: string;
  hora: string;
};

export const WEEK_DAYS = [
  { key: "lunes", short: "L", label: "Lunes" },
  { key: "martes", short: "M", label: "Martes" },
  { key: "miercoles", short: "M", label: "Miercoles" },
  { key: "jueves", short: "J", label: "Jueves" },
  { key: "viernes", short: "V", label: "Viernes" },
  { key: "sabado", short: "S", label: "Sabado" },
  { key: "domingo", short: "D", label: "Domingo" },
] as const;

export function getTimeZone() {
  return (
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Mexico_City"
  );
}

export function addMinutesToLocal(fecha: string, hora: string, minutes: number) {
  if (!fecha || !hora) {
    return { fecha: "", hora: "", fechaHoraLocal: "" };
  }

  const date = new Date(`${fecha}T${hora}:00`);
  if (Number.isNaN(date.getTime())) {
    return { fecha: "", hora: "", fechaHoraLocal: "" };
  }

  date.setMinutes(date.getMinutes() + Math.max(0, Math.round(minutes || 0)));

  const nextFecha = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  const nextHora = [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
  ].join(":");

  return {
    fecha: nextFecha,
    hora: nextHora,
    fechaHoraLocal: `${nextFecha}T${nextHora}`,
  };
}

export function formatDateTime(fecha: string, hora: string) {
  if (!fecha || !hora) return "Pendiente";
  return `${fecha} ${hora}`;
}

function localDateTime(fecha: string, hora: string) {
  return `${fecha}T${hora}`;
}

export function hasValidSchedule(
  tipo: TipoSalida,
  single: SingleSchedule,
  recurring: RecurringSchedule,
  special: SpecialOccurrence[],
) {
  if (tipo === "UNICA") return Boolean(single.fecha && single.hora);

  if (tipo === "RECURRENTE") {
    return Object.values(recurring).some((times) => times.length > 0);
  }

  return special.some((item) => item.fecha && item.hora);
}

export function buildHorarioConfiguracion(
  tipo: TipoSalida,
  single: SingleSchedule,
  recurring: RecurringSchedule,
  special: SpecialOccurrence[],
  durationMin: number,
): HorarioConfiguracionSalida {
  const zonaHoraria = getTimeZone();
  const duracionMin = Math.max(0, Math.round(durationMin || 0));

  if (tipo === "UNICA") {
    return {
      tipo,
      zonaHoraria,
      duracionMin,
      inicio: {
        fecha: single.fecha,
        hora: single.hora,
        fechaHoraLocal: localDateTime(single.fecha, single.hora),
      },
      finCalculado: addMinutesToLocal(single.fecha, single.hora, duracionMin),
    };
  }

  if (tipo === "RECURRENTE") {
    return {
      tipo,
      zonaHoraria,
      duracionMin,
      dias: WEEK_DAYS.map((day) => ({
        dia: day.key,
        horarios: [...(recurring[day.key] || [])]
          .sort()
          .map((horaInicio) => ({
            horaInicio,
            horaFinEstimada: addMinutesToLocal("2026-01-05", horaInicio, duracionMin)
              .hora,
          })),
      })).filter((day) => day.horarios.length > 0),
    };
  }

  return {
    tipo,
    zonaHoraria,
    duracionMin,
    ocurrencias: special
      .filter((item) => item.fecha && item.hora)
      .map((item) => ({
        fecha: item.fecha,
        horaInicio: item.hora,
        fechaHoraLocal: localDateTime(item.fecha, item.hora),
        finCalculado: addMinutesToLocal(item.fecha, item.hora, duracionMin),
      })),
  };
}

export function scheduleSummary(
  tipo: TipoSalida,
  single: SingleSchedule,
  recurring: RecurringSchedule,
  special: SpecialOccurrence[],
  durationMin: number,
) {
  if (tipo === "UNICA") {
    const arrival = addMinutesToLocal(single.fecha, single.hora, durationMin);
    return single.fecha && single.hora
      ? `Salida ${formatDateTime(single.fecha, single.hora)} / llegada ${formatDateTime(arrival.fecha, arrival.hora)}`
      : "Fecha y hora pendientes";
  }

  if (tipo === "RECURRENTE") {
    const count = Object.values(recurring).reduce(
      (total, times) => total + times.length,
      0,
    );
    return `${count} horario${count === 1 ? "" : "s"} semanal${count === 1 ? "" : "es"}`;
  }

  const count = special.filter((item) => item.fecha && item.hora).length;
  return `${count} ocurrencia${count === 1 ? "" : "s"} especial${count === 1 ? "" : "es"}`;
}
