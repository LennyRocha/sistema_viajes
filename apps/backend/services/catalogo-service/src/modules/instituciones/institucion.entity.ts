import { Auditory } from '@commons/types';

export interface Institucion extends Auditory {
  id?: number;
  nombre: string;
  descripcion: string;
  imagen_url: string;
  slug: string;
  estatus: boolean;
}
