import AutobusEstado from "./AutobusEstado";
export const AutobusEstadoLabel: Record<
  AutobusEstado,
  string
> = {
  [AutobusEstado.DISPONIBLE]: "Disponible",
  [AutobusEstado.EN_RUTA]: "En viaje",
  [AutobusEstado.EN_MANTENIMIENTO]: "En mantenimiento",
  [AutobusEstado.FUERA_DE_SERVICIO]: "Fuera de servicio",
};
