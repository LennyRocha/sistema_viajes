import { EstadoSalida } from '../salidas/types/estado-salida';
import { TipoSalida } from '../salidas/types/tipo-salida';
import {
  CalendarioDiaResumen,
  CalendarioMesResponse,
  CalendarioDia,
  CalendarioSemana,
  CalendarioSalidaSource,
  EstadoSalidaValue,
  CalendarioViajeItem,
} from './types/calendario-viajes.types';

const STATUS_KEYS: Record<EstadoSalidaValue, keyof CalendarioDiaResumen> = {
  [EstadoSalida.PROGRAMADO]: 'programado',
  [EstadoSalida.EN_CURSO]: 'enCurso',
  [EstadoSalida.FINALIZADO]: 'finalizado',
  [EstadoSalida.CANCELADO]: 'cancelado',
};

const WEEKDAY_KEYS = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
];

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function monthLabel(year: number, month: number) {
  const label = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(
    new Date(year, month - 1, 1),
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function emptySummary(): CalendarioDiaResumen {
  return {
    programado: 0,
    enCurso: 0,
    finalizado: 0,
    cancelado: 0,
  };
}

function readString(value: unknown, key: string): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const current = (value as Record<string, unknown>)[key];
  return typeof current === 'string' && current.trim() ? current : null;
}

function readPlaceName(value: unknown) {
  return readString(value, 'nombre') ?? readString(value, 'direccion');
}

function getRouteEdges(salida: CalendarioSalidaSource) {
  const rutas = [...(salida.viaje?.rutas ?? [])].sort(
    (a, b) => a.orden - b.orden,
  );
  const first = rutas[0]?.ruta;
  const last = rutas[rutas.length - 1]?.ruta;

  return {
    origen: readPlaceName(first?.origen) ?? null,
    destino: readPlaceName(last?.destino) ?? null,
  };
}

function getActiveSeatCount(salida: CalendarioSalidaSource, now: Date) {
  const ocupados = new Set<string>();

  (salida.boletos ?? []).forEach((boleto) => {
    const expiraEn = boleto.expiraEn ? new Date(boleto.expiraEn) : null;
    const active =
      boleto.estado === 'CONFIRMADA' ||
      (boleto.estado === 'PENDIENTE' && expiraEn && expiraEn > now);

    if (!active || !Array.isArray(boleto.asientos)) return;

    boleto.asientos.forEach((asiento) => {
      if (typeof asiento === 'string') ocupados.add(asiento);
    });
  });

  return ocupados.size;
}

function getBaseItem(
  salida: CalendarioSalidaSource,
  now: Date,
): Omit<CalendarioViajeItem, 'fecha' | 'horaSalida' | 'horaLlegada'> {
  const { origen, destino } = getRouteEdges(salida);
  const asientosOcupados = getActiveSeatCount(salida, now);

  return {
    salidaId: salida.id,
    viajeBaseId: salida.viajeBaseId,
    viajeNombre: salida.viaje?.nombre ?? `Viaje #${salida.viajeBaseId}`,
    tipoSalida: salida.tipoSalida,
    estadoSalida: salida.estadoSalida,
    origen,
    destino,
    conductorId: salida.conductorId,
    autobusId: salida.autobusId,
    asientosDisponibles: Math.max(0, salida.capacidadTotal - asientosOcupados),
    capacidadTotal: salida.capacidadTotal,
  };
}

function getHorarioRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
}

export function expandSalidaToCalendarItems(
  salida: CalendarioSalidaSource,
  rangeStart: string,
  rangeEnd: string,
  now = new Date(),
): CalendarioViajeItem[] {
  const horario = getHorarioRecord(salida.horario_configuracion);
  const base = getBaseItem(salida, now);

  if (salida.tipoSalida === TipoSalida.UNICA) {
    const inicio = getHorarioRecord(horario.inicio);
    const fin = getHorarioRecord(horario.finCalculado);
    const fecha = readString(inicio, 'fecha');
    if (!fecha || fecha < rangeStart || fecha > rangeEnd) return [];

    return [
      {
        ...base,
        fecha,
        horaSalida: readString(inicio, 'hora'),
        horaLlegada: readString(fin, 'hora'),
      },
    ];
  }

  if (salida.tipoSalida === TipoSalida.ESPECIAL) {
    const ocurrencias = Array.isArray(horario.ocurrencias)
      ? horario.ocurrencias
      : [];

    return ocurrencias.flatMap((ocurrencia: unknown) => {
      const record = getHorarioRecord(ocurrencia);
      const fin = getHorarioRecord(record.finCalculado);
      const fecha = readString(record, 'fecha');
      if (!fecha || fecha < rangeStart || fecha > rangeEnd) return [];

      return [
        {
          ...base,
          fecha,
          horaSalida: readString(record, 'horaInicio'),
          horaLlegada: readString(fin, 'hora'),
        },
      ];
    });
  }

  if (salida.tipoSalida === TipoSalida.RECURRENTE) {
    const dias = Array.isArray(horario.dias) ? horario.dias : [];
    const byDay = new Map<string, Array<Record<string, unknown>>>();

    dias.forEach((day: unknown) => {
      const record = getHorarioRecord(day);
      const dia = readString(record, 'dia');
      const horarios = Array.isArray(record.horarios) ? record.horarios : [];
      if (dia) byDay.set(dia, horarios.map(getHorarioRecord));
    });

    const items: CalendarioViajeItem[] = [];
    let cursor = parseDateKey(rangeStart);
    const end = parseDateKey(rangeEnd);

    while (cursor <= end) {
      const fecha = toDateKey(cursor);
      const dayKey = WEEKDAY_KEYS[cursor.getDay()];
      const horarios = byDay.get(dayKey) ?? [];

      horarios.forEach((item) => {
        items.push({
          ...base,
          fecha,
          horaSalida: readString(item, 'horaInicio'),
          horaLlegada: readString(item, 'horaFinEstimada'),
        });
      });

      cursor = addDays(cursor, 1);
    }

    return items;
  }

  return [];
}

export function buildCalendarioMes(
  year: number,
  month: number,
  salidas: CalendarioSalidaSource[],
  today = new Date(),
): CalendarioMesResponse {
  const firstMonthDay = new Date(year, month - 1, 1);
  const lastMonthDay = new Date(year, month, 0);
  const gridStart = addDays(firstMonthDay, -firstMonthDay.getDay());
  const gridEnd = addDays(lastMonthDay, 6 - lastMonthDay.getDay());
  const rangeStart = toDateKey(gridStart);
  const rangeEnd = toDateKey(gridEnd);
  const todayKey = toDateKey(today);
  const itemsByDate = new Map<string, CalendarioViajeItem[]>();

  salidas
    .flatMap((salida) =>
      expandSalidaToCalendarItems(salida, rangeStart, rangeEnd, today),
    )
    .forEach((item) => {
      const current = itemsByDate.get(item.fecha) ?? [];
      current.push(item);
      itemsByDate.set(item.fecha, current);
    });

  itemsByDate.forEach((items) => {
    items.sort((a, b) => (a.horaSalida ?? '99:99').localeCompare(b.horaSalida ?? '99:99'));
  });

  const weeks: CalendarioSemana[] = [];
  let cursor = new Date(gridStart);
  let weekIndex = 0;

  while (cursor <= gridEnd) {
    const days: CalendarioDia[] = [];

    for (let index = 0; index < 7; index += 1) {
      const date = toDateKey(cursor);
      const items = itemsByDate.get(date) ?? [];
      const summary = items.reduce<CalendarioDiaResumen>((acc, item) => {
        acc[STATUS_KEYS[item.estadoSalida]] += 1;
        return acc;
      }, emptySummary());

      days.push({
        date,
        day: cursor.getDate(),
        isCurrentMonth: cursor.getMonth() === month - 1,
        isToday: date === todayKey,
        total: items.length,
        summary,
        items,
      });

      cursor = addDays(cursor, 1);
    }

    weeks.push({ weekIndex, days });
    weekIndex += 1;
  }

  const monthStart = toDateKey(firstMonthDay);
  const monthEnd = toDateKey(lastMonthDay);
  const totalEventos = [...itemsByDate.entries()].reduce(
    (total, [date, items]) =>
      date >= monthStart && date <= monthEnd ? total + items.length : total,
    0,
  );

  return {
    year,
    month,
    monthLabel: monthLabel(year, month),
    rangeStart,
    rangeEnd,
    totalEventos,
    weeks,
  };
}
