export enum AsientoEstado {
  AVAILABLE = "AVAILABLE",
  SELECTED = "SELECTED",
  RESERVED = "RESERVED",
  SOLD = "SOLD",
  OUT_OF_SERVICE = "OUT_OF_SERVICE",
}

export interface Asiento {
  id: string;
  x: number;
  y: number;
  label: string;
  estado: AsientoEstado;
}

export interface Pasajero {
  nombres: string;
  apellidos: string;
  asiento: Asiento;
}
