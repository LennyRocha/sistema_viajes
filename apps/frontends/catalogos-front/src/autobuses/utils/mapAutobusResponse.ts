export function mapAutobusResponseToFormValues(
  data: any,
): unknown {
  return {
    ...data,
    servicios: (data.servicios ?? []).map((s: any) => ({
      servicioId: s.servicio_id,
      configuracion_servicio: s.config_servicio,
    })),
  };
}
