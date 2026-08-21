import RutaBase from "../types/RutaBase";
import ViajeBase from "../types/ViajeBase";
import { RutaApi, ViajeBaseApi } from "../types/OperacionesApi";

const ROUTE_COLORS = [
  "#1f618d",
  "#2f855a",
  "#b7791f",
  "#6b46c1",
  "#c53030",
  "#0f766e",
];

export function routeColor(id: number) {
  return ROUTE_COLORS[Math.abs(id) % ROUTE_COLORS.length];
}

export function isGoogleStreetViewImage(url?: string | null) {
  return Boolean(url?.includes("maps.googleapis.com/maps/api/streetview"));
}

export function mapRutaApi(ruta: RutaApi): RutaBase {
  const paradaMin = (ruta.paradas || []).reduce(
    (total, parada) => total + (parada.tiempoParadaMin || 0),
    0,
  );

  return {
    id: ruta.id,
    nombre: ruta.nombre,
    descripcion: ruta.descripcion || "",
    origen: ruta.origen,
    destino: ruta.destino,
    paradas: ruta.paradas || [],
    waypoints: ruta.waypoints,
    encodedPolyline: ruta.encodedPolyline,
    distanciaKm: ruta.distanciaMetros
      ? Number((ruta.distanciaMetros / 1000).toFixed(1))
      : 0,
    duracionMin: ruta.duracionSegundos
      ? Math.max(1, Math.round(ruta.duracionSegundos / 60))
      : paradaMin
        ? paradaMin
      : 0,
    estatus: ruta.estatus,
    color: routeColor(ruta.id),
  };
}

export function mapViajeApi(viaje: ViajeBaseApi): ViajeBase {
  const configRutas =
    viaje.config_rutas ??
    viaje.rutas.map((item) => ({
      id_ruta: item.rutaId,
      estado: "solo-ida" as const,
    }));

  return {
    id: viaje.id,
    nombre: viaje.nombre,
    descripcion: viaje.descripcion || "",
    duracionCalculadaMin: viaje.duracionCalculadaMin || 0,
    margenMin: viaje.margenMin || 0,
    duracionTotalMin: viaje.duracionTotalMin || 0,
    imagenUrl: isGoogleStreetViewImage(viaje.imagenUrl) ? undefined : viaje.imagenUrl,
    imagenBase64: viaje.imagenBase64 || undefined,
    imagenStorage: viaje.imagenStorage,
    config_rutas: configRutas,
    estatus: viaje.estatus,
    servicios: [],
    rutas: viaje.rutas.map((item) => ({
      ...mapRutaApi(item.ruta),
      conexionAnterior: item.conexion,
      distanciaConexionAnteriorMetros: item.distanciaConexionMetros,
      requiereConexionAnterior: item.requiereConexion,
    })),
  };
}
