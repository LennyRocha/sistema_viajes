import { Injectable } from '@nestjs/common';

export type ReportRequestContext = {
  ip?: string;
  userAgent?: string;
  metodo?: string;
  ruta?: string;
  requestId?: string;
};

export type ReportActivity = ReportRequestContext & {
  evento: string;
  categoria: string;
  accion: string;
  modulo: string;
  resultado: 'EXITO' | 'FALLO' | 'DENEGADO';
  severidad: 'INFO' | 'ADVERTENCIA' | 'CRITICO';
  usuarioId?: number;
  email?: string;
  roles?: string[];
  recurso?: string;
  recursoId?: string;
  mensaje?: string;
  detalles?: Record<string, unknown>;
};

@Injectable()
export class ReportActivityPublisher {
  record(activity: ReportActivity): void {
    const recordServiceUrl =
      process.env.RECORD_SERVICE_URL ?? 'http://localhost:5004';
    const internalToken = process.env.INTERNAL_SERVICE_TOKEN;

    if (!internalToken) return;

    void fetch(`${recordServiceUrl}/internal/reportes/actividad`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-internal-service-token': internalToken,
      },
      body: JSON.stringify(activity),
    }).catch(() => undefined);
  }
}
