export default interface GeoPoint {
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  placeId?: string;
  clientId?: string;
  isResolving?: boolean;
  tiempoParadaMin?: number;
}
