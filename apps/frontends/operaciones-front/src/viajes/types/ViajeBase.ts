import RutaBase from "./RutaBase";

export default interface ViajeBase {
  id: number;
  nombre: string;
  descripcion: string;
  rutas: RutaBase[];
  servicios: string[];
  frecuencia: string;
  proximaApertura: string;
  estatus: boolean;
}
