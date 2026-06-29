import CampoServicio from "./CampoServicio";

export default interface ServicioExterno {
  id?: number;
  nombre: string;
  icono_nombre: string;
  estatus: boolean;
  propiedades: CampoServicio[];
}
