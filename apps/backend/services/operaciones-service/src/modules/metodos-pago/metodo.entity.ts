import { Auditory } from "@commons/types";
import Compra from "../Compras/compras.entity";

export interface MetodoPago extends Auditory {
  id: number;
  nombre: string;
  descripcion: string;
  estatus: boolean;
  compras?: Compra[];
}
