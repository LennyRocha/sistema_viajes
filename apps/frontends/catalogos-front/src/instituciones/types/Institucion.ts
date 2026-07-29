import { Auditory } from "@nexoroute/commons";

export default interface Institucion extends Auditory{
  id?: number;
  nombre: string;
  descripcion: string;
  estatus: boolean;
  slug: string;
}
