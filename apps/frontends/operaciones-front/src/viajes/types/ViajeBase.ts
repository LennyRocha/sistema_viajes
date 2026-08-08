import RutaBase from "./RutaBase";
import { RutaTipo } from "./RutaTipo";

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
  config_rutas: RutaTipo[];
  estatus: boolean;
}
