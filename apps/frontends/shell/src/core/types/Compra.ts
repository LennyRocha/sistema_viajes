import Asiento from "./Asiento";

export interface Compra {
  publicId?: string;
  salidaId: number;
  compradorId?: number;
  comprador?: Comprador;
  pasajeros: number;
  asientos: Pasajero[];
  fechaCompra?: Date;
  monto: number;
  rutaId: number;
  codigo?: string;
  metodoPagoId: number;
  abordado: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Comprador {
  id?: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  email: string;
  telefono: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Pasajero {
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  asiento: Asiento;
}
