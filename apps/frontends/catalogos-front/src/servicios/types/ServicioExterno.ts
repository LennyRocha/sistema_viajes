import { Auditory } from "@nexoroute/commons";
import CampoServicio from "./CampoServicio";
import DisponibilidadServicio from "./ServicioTipoInstitucion";

export default interface ServicioExterno extends Auditory {
  id?: number;
  nombre: string;
  descripcion: string;
  icono_nombre: string;
  estatus: boolean;
  slug: string;
  propiedades: CampoServicio[];
  serviciosPorTipos: DisponibilidadServicio[];
}
