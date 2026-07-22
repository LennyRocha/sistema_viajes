import { Auditory } from '@commons/types';
import CampoConfig from './types/CampoConfig';
import DisponibilidadServicio from '../disponibilidad-servicios/disponibilidad-servicio.entity';

export default interface ServicioExterno extends Auditory {
  id?: number;
  nombre: string;
  descripcion: string;
  icono_nombre: string;
  estatus: boolean;
  propiedades: CampoConfig[];
  slug: string;
  serviciosPorTipos: DisponibilidadServicio[];
}
