import { AsientoEstado } from "./AsientoEstado";

export default interface Asiento {
  id: string;
  x: number;
  y: number;
  label: string;
  estado: AsientoEstado;
}
