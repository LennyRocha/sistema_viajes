import GeoPoint from "./GeoPoint";

export type RutaApi = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  origen: GeoPoint;
  destino: GeoPoint;
  paradas: GeoPoint[];
  waypoints?: GeoPoint[] | null;
  encodedPolyline?: string | null;
  distanciaMetros?: number | null;
  duracionSegundos?: number | null;
  estatus: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedRutasApi = {
  data: RutaApi[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ViajeBaseRutaApi = {
  id: number;
  viajeBaseId: number;
  rutaId: number;
  orden: number;
  conexion?: GeoPoint[] | null;
  conexionEncodedPolyline?: string | null;
  distanciaConexionMetros?: number | null;
  requiereConexion: boolean;
  ruta: RutaApi;
};

export type ViajeBaseApi = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  frecuencia?: string | null;
  duracionCalculadaMin?: number | null;
  margenMin?: number | null;
  duracionTotalMin?: number | null;
  imagenUrl?: string | null;
  imagenBase64?: string | null;
  imagenStorage?: string | null;
  estatus: boolean;
  createdAt?: string;
  updatedAt?: string;
  rutas: ViajeBaseRutaApi[];
};

export type PaginatedViajesBaseApi = {
  data: ViajeBaseApi[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ConexionValidadaApi = {
  desdeRutaId: number;
  hastaRutaId: number;
  distanciaMetros: number;
  toleranciaMetros: number;
  conectado: boolean;
  requiereConexion: boolean;
};

export type ValidacionViajeApi = {
  toleranciaMetros: number;
  valido: boolean;
  conexiones: ConexionValidadaApi[];
};

export type CreateRutaBody = {
  nombre: string;
  descripcion?: string;
  origen: GeoPoint;
  destino: GeoPoint;
  paradas: GeoPoint[];
  waypoints?: GeoPoint[];
  encodedPolyline?: string;
  distanciaMetros?: number;
  duracionSegundos?: number;
  estatus?: boolean;
};

export type CreateViajeBaseBody = {
  nombre: string;
  descripcion?: string;
  frecuencia?: string;
  duracionCalculadaMin?: number;
  margenMin?: number;
  duracionTotalMin?: number;
  imagenUrl?: string;
  imagenBase64?: string;
  imagenStorage?: string;
  estatus?: boolean;
  rutas: Array<{
    rutaId: number;
    orden: number;
    conexion?: GeoPoint[];
    conexionEncodedPolyline?: string;
    distanciaConexionMetros?: number;
  }>;
};
