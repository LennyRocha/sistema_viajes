import { Auditory } from '@commons/types';
import { EstadoCompra } from '../../../generated/prisma/client';

export default interface Compra extends Auditory {
  id?: number;
  publicId?: string;
  salidaId: number;
  compradorId: number;
  pasajeros: number;
  asientos: string[];
  fechaCompra?: Date;
  monto: number;
  codigo: string;
  estado: EstadoCompra; // tu type local, ya no el de generated/prisma
  expiraEn?: Date | null;
  abordado?: boolean;
}