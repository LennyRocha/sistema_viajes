import { Auditory } from "@commons/types";

export interface MetodoPago extends Auditory {
  id: number;
  nombre: string;
  descripcion: string;
  estatus: boolean;
  compras?: any[];
}
