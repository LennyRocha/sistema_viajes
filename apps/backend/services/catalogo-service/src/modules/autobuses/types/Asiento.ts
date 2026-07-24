import { AsientoEstado } from './AsientoEstado';

export interface Asiento {
  id: string;
  x: number;
  y: number;
  label: string;
  estado: AsientoEstado;
}
