import { Auditory } from '@commons/types';
import CampoConfig from './types/CampoConfig';
import DisponibilidadServicio from './types/ServicioTipoInstitucion';

export default interface ServicioExterno extends Auditory {
  id?: number;
  nombre: string;
  descripcion: string;
  icono_nombre: string;
  estatus: boolean;
  propiedades: CampoConfig[];
  disponibilidad: DisponibilidadServicio[];
}
