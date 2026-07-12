import { Auditory } from '@commons/types';

export interface TipoAutobus extends Auditory {
  id: number;
  nombre: string;
  descripcion: string;
  linea: string;
  capacidad: number;
}
