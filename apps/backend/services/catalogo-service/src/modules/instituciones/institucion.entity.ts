import { Auditory } from '@commons/types';

export interface Institucion extends Auditory {
  id?: number;
  nombre: string;
  descripcion: string;
  estatus: boolean;
}
