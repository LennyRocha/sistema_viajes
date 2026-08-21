import { EstadoSalida, TipoSalida } from "../../salidas/types/SalidasApi";

export type CalendarioViajeItem = {
  salidaId: number;
  viajeBaseId: number;
  viajeNombre: string;
  tipoSalida: TipoSalida;
  estadoSalida: EstadoSalida;
  fecha: string;
  horaSalida: string | null;
  horaLlegada: string | null;
  origen: string | null;
  destino: string | null;
  conductorId: number;
  autobusId: number;
  asientosDisponibles: number;
  capacidadTotal: number;
};

export type CalendarioDiaResumen = {
  programado: number;
  enCurso: number;
  finalizado: number;
  cancelado: number;
};

export type CalendarioDia = {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  total: number;
  summary: CalendarioDiaResumen;
  items: CalendarioViajeItem[];
};

export type CalendarioSemana = {
  weekIndex: number;
  days: CalendarioDia[];
};

export type CalendarioMesResponse = {
  year: number;
  month: number;
  monthLabel: string;
  rangeStart: string;
  rangeEnd: string;
  totalEventos: number;
  weeks: CalendarioSemana[];
};

export type CalendarioMesFilters = {
  estadoSalida?: EstadoSalida | "TODOS";
  viajeBaseId?: number;
  conductorId?: number;
  autobusId?: number;
};
