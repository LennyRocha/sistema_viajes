import GeoPoint from "./GeoPoint";

export default interface RutaBase {
  id: number;
  nombre: string;
  descripcion?: string;
  origen: GeoPoint;
  destino: GeoPoint;
  paradas: GeoPoint[];
  distanciaKm: number;
  duracionMin: number;
  estatus?: boolean;
  color?: string;
  encodedPolyline?: string | null;
  waypoints?: GeoPoint[] | null;
  conexionAnterior?: GeoPoint[] | null;
  distanciaConexionAnteriorMetros?: number | null;
  requiereConexionAnterior?: boolean;
}
