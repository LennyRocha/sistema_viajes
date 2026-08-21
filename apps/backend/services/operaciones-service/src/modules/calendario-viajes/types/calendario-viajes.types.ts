import { EstadoSalida } from '../../salidas/types/estado-salida';
import { TipoSalida } from '../../salidas/types/tipo-salida';

export type TipoSalidaValue = TipoSalida | 'UNICA' | 'RECURRENTE' | 'ESPECIAL';
export type EstadoSalidaValue =
  | EstadoSalida
  | 'PROGRAMADO'
  | 'EN_CURSO'
  | 'FINALIZADO'
  | 'CANCELADO';

export type CalendarioViajeItem = {
  salidaId: number;
  viajeBaseId: number;
  viajeNombre: string;
  tipoSalida: TipoSalidaValue;
  estadoSalida: EstadoSalidaValue;
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

export type CalendarioSalidaSource = {
  id: number;
  autobusId: number;
  conductorId: number;
  viajeBaseId: number;
  tipoSalida: TipoSalidaValue;
  estadoSalida: EstadoSalidaValue;
  horario_configuracion: unknown;
  capacidadTotal: number;
  boletos?: Array<{
    salidaId?: number;
    estado: string;
    expiraEn?: Date | string | null;
    asientos?: unknown;
  }>;
  viaje?: {
    nombre?: string | null;
    rutas?: Array<{
      orden: number;
      ruta?: {
        origen?: unknown;
        destino?: unknown;
      } | null;
    }>;
  } | null;
};
