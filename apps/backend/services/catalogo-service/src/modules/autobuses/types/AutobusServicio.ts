export interface AutobusServicio {
  id?: number;
  autobusId: number;
  servicioId: number;
  configuracion_servicio: Record<string, any>;
  activo: boolean;
}
