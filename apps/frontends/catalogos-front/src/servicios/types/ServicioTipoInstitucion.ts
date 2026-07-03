import { Auditory } from "@nexoroute/commons";

export default interface DisponibilidadServicio extends Auditory {
  id?: number;
  tipoId: number;
  institucionId: number;
  servicioId: number;
  activo: boolean;
}
