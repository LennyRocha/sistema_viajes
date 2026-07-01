import CampoServicio from "./CampoServicio";
import ServicioTipoInstitucion from "./ServicioTipoInstitucion";

export default interface ServicioExterno {
  id?: number;
  nombre: string;
  icono_nombre: string;
  estatus: boolean;
  propiedades: CampoServicio[];
  servicio_tipo_institucion: ServicioTipoInstitucion[];
}
