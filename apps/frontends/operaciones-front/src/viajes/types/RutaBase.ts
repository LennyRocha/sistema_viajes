import GeoPoint from "./GeoPoint";

export default interface RutaBase {
  id: number;
  nombre: string;
  origen: GeoPoint;
  destino: GeoPoint;
  paradas: GeoPoint[];
  distanciaKm: number;
  duracionMin: number;
}
