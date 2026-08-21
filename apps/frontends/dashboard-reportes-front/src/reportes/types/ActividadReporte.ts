export type ResultadoActividad = "EXITO" | "FALLO" | "DENEGADO";

export interface ActividadReporte {
  id: number;
  fecha: string;
  evento: string;
  categoria: string;
  accion: string;
  modulo: string;
  resultado: ResultadoActividad;
  severidad: "INFO" | "ADVERTENCIA" | "CRITICO";
  usuarioId?: number;
  email?: string;
  roles: string[];
  ip?: string;
  userAgent?: string;
  metodo?: string;
  ruta?: string;
  recurso?: string;
  recursoId?: string;
  mensaje?: string;
  detalles?: Record<string, unknown>;
  requestId?: string;
}

export interface ActividadReporteResponse {
  items: ActividadReporte[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total: number;
    exitos: number;
    fallos: number;
    denegados: number;
  };
}

export interface ActividadReporteFilters {
  search: string;
  categoria: string;
  resultado: string;
  desde: string;
  hasta: string;
}
