import { Auditory } from "@nexoroute/commons";

export default interface DisponibilidadServicio extends Auditory {
  id?: number;
  tipo_autobus_id: number;
  institucion_id: number;
  servicio_id: number;
  activo: boolean;
}
