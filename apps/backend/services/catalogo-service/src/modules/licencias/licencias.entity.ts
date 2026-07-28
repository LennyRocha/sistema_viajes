import { Auditory } from '@commons/types';
import Conductor from '../conductores/conductores.entity';

export default interface Licencia extends Auditory {
  id?: number;

  conductor: Conductor;
  conductor_id: number;

  numero_licencia: string;
  categoria: string;
  fecha_expedicion: Date;
  fecha_vencimiento: Date;
  estado_emisor: string;
  imagen_licencia: string;

  vigente: boolean;
}