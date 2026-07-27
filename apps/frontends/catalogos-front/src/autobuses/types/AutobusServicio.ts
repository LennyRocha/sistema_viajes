export default interface AutobusServicio {
  servicio_id?: number;
  config_servicio?: Record<string, any>;
  id?: number;
  autobusId: number;
  servicioId: number;
  configuracion_servicio: Record<string, any>;
  activo: boolean;
}
