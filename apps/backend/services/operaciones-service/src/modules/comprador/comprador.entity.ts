// src/modules/compradores/entities/comprador.entity.ts
import { Auditory } from '@commons/types';

export default interface Comprador extends Auditory {
  id?: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  email: string;
}