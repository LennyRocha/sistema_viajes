import GeoPoint from "../types/GeoPoint";
import RutaBase from "../types/RutaBase";

export type ConnectionSegment = {
  id: string;
  fromRouteId: number;
  toRouteId: number;
  from: GeoPoint;
  to: GeoPoint;
  distanceMeters: number;
  path?: GeoPoint[];
};

export const CONNECTION_TOLERANCE_METERS = 100;

export function getRoutePoints(route: RutaBase): GeoPoint[] {
  return [route.origen, ...route.paradas, route.destino];
}

export function getRouteSimulationPath(route: RutaBase): GeoPoint[] {
  return route.waypoints?.length ? route.waypoints : getRoutePoints(route);
}

function pushPointIfDifferent(points: GeoPoint[], point: GeoPoint) {
  const last = points[points.length - 1];
  if (!last || distanceMeters(last, point) > 2) points.push(point);
}

export function buildJourneySimulationPath(
  routes: RutaBase[],
  connections: ConnectionSegment[] = [],
): GeoPoint[] {
  const path: GeoPoint[] = [];
  const connectionByTarget = new Map(
    connections.map((connection) => [connection.toRouteId, connection]),
  );

  routes.forEach((route, index) => {
    if (index > 0) {
      const connection = connectionByTarget.get(route.id);
      if (connection) {
        const connectionPath = connection.path?.length
          ? connection.path
          : [connection.from, connection.to];
        connectionPath.forEach((point) => pushPointIfDifferent(path, point));
      }
    }

    getRouteSimulationPath(route).forEach((point) => pushPointIfDifferent(path, point));
  });

  return path;
}

export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const earthRadius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function buildConnectionSegments(
  routes: RutaBase[],
  toleranceMeters = CONNECTION_TOLERANCE_METERS,
): ConnectionSegment[] {
  const segments: ConnectionSegment[] = [];

  for (let index = 0; index < routes.length - 1; index += 1) {
    const current = routes[index];
    const next = routes[index + 1];
    const distance = distanceMeters(current.destino, next.origen);

    if (distance > toleranceMeters) {
      segments.push({
        id: `${current.id}-${next.id}`,
        fromRouteId: current.id,
        toRouteId: next.id,
        from: current.destino,
        to: next.origen,
        distanceMeters: next.distanciaConexionAnteriorMetros ?? distance,
        path: next.conexionAnterior || undefined,
      });
    }
  }

  return segments;
}

export function formatMeters(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function getJourneyMetrics(routes: RutaBase[], connections: ConnectionSegment[]) {
  return {
    distanceKm:
      routes.reduce((total, route) => total + route.distanciaKm, 0) +
      connections.reduce((total, item) => total + item.distanceMeters / 1000, 0),
    durationMin:
      routes.reduce((total, route) => total + route.duracionMin, 0) +
      connections.reduce((total, item) => total + Math.max(3, item.distanceMeters / 450), 0),
    stops: routes.reduce((total, route) => total + route.paradas.length, 0),
  };
}
