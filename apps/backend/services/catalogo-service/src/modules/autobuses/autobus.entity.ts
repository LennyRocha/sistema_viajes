import { Auditory } from '@commons/types';
import { TipoAutobus } from '../tipos_autobus/tipo_bus.entity';
import { Institucion } from '../instituciones/institucion.entity';
import { AutobusEstado } from './types/AutobusEstado';
import { AutobusServicio } from './types/AutobusServicio';
import { Asiento } from './types/Asiento';

export default interface Autobus extends Auditory {
  id?: number;
  institucion: Institucion;
  tipo: TipoAutobus;
  alias: string;
  marca: string;
  modelo: string;
  descripcion: string;
  ano: number;
  capacidad: number;
  color: string;
  codigo_interno: string;
  estado: AutobusEstado;
  estatus: boolean;
  slug: string;
  asientos: Asiento[];
  servicios?: AutobusServicio[];
  institucion_id: number;
  tipo_autobus_id: number;
}
