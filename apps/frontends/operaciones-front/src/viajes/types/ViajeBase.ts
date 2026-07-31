import RutaBase from "./RutaBase";

export default interface ViajeBase {
  id: number;
  nombre: string;
  descripcion: string;
  rutas: RutaBase[];
  servicios: string[];
  duracionCalculadaMin: number;
  margenMin: number;
  duracionTotalMin: number;
  imagenUrl?: string | null;
  imagenBase64?: string | null;
  imagenStorage?: string | null;
  estatus: boolean;
}
