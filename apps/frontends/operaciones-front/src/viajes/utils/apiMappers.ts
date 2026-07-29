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

export function mapRutaApi(ruta: RutaApi): RutaBase {
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
      : 0,
    estatus: ruta.estatus,
    color: routeColor(ruta.id),
  };
}

export function mapViajeApi(viaje: ViajeBaseApi): ViajeBase {
  return {
    id: viaje.id,
    nombre: viaje.nombre,
    descripcion: viaje.descripcion || "",
    frecuencia: viaje.frecuencia || "Sin frecuencia definida",
    proximaApertura: "Pendiente de calendario",
    estatus: viaje.estatus,
    servicios: [],
    rutas: viaje.rutas.map((item) => mapRutaApi(item.ruta)),
  };
}
