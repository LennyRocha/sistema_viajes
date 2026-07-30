"use client";

import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StreetviewIcon from "@mui/icons-material/Streetview";
import GeoPoint from "../types/GeoPoint";
import RutaBase from "../types/RutaBase";
import { ConnectionSegment, formatMeters, getRoutePoints } from "../utils/routeUtils";

declare global {
  interface Window {
    google?: any;
    __nexorouteGoogleMapsPromise?: Promise<void>;
  }
}

export type RouteMetrics = {
  distanciaMetros: number;
  duracionSegundos: number;
  overviewPath: GeoPoint[];
};

export type PlaceSuggestion = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText?: string;
};

type EditingTarget = "origen" | "destino" | "parada";
type MapPointAction = {
  replaceClientId?: string;
};

type Props = {
  routes?: RutaBase[];
  connections?: ConnectionSegment[];
  markerPoints?: Array<GeoPoint & { markerRole?: EditingTarget }>;
  height?: number;
  title?: string;
  editable?: boolean;
  editingTarget?: EditingTarget;
  onMapPoint?: (point: GeoPoint, target: EditingTarget, action?: MapPointAction) => void;
  onRouteMetrics?: (metrics: RouteMetrics) => void;
  editableConnections?: boolean;
  onConnectionPathChange?: (connectionId: string, path: GeoPoint[], distanceMeters: number) => void;
  enableStreetView?: boolean;
  enableSimulation?: boolean;
  simulationRoute?: RutaBase | null;
  simulationPath?: GeoPoint[];
};

const DEFAULT_CENTER = { lat: 23.6345, lng: -102.5528 };
const EMPTY_ROUTES: RutaBase[] = [];
const EMPTY_CONNECTIONS: ConnectionSegment[] = [];
const EMPTY_MARKERS: NonNullable<Props["markerPoints"]> = [];
const FALLBACK_COLORS = ["#1f618d", "#2f855a", "#b7791f", "#6b46c1"];
const STOP_COLOR = "#d97706";
const ORIGIN_DESTINATION_COLOR = "#1f618d";

export function ensureGoogleMaps(apiKey?: string) {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (!apiKey) return Promise.reject(new Error("Falta Google Maps API key"));
  if (window.__nexorouteGoogleMapsPromise) {
    return window.__nexorouteGoogleMapsPromise;
  }

  window.__nexorouteGoogleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
    document.head.appendChild(script);
  });

  return window.__nexorouteGoogleMapsPromise;
}

export async function geocodeAddress(address: string, apiKey?: string): Promise<GeoPoint> {
  await ensureGoogleMaps(apiKey);

  return new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results: any[], status: string) => {
      if (status !== "OK" || !results?.[0]) {
        reject(new Error("No se encontro la direccion"));
        return;
      }
      const result = results[0];
      const location = result.geometry.location;
      resolve({
        nombre: result.name || result.formatted_address.split(",")[0],
        direccion: result.formatted_address,
        lat: location.lat(),
        lng: location.lng(),
        placeId: result.place_id,
      } as GeoPoint);
    });
  });
}

export async function searchPlacePredictions(
  input: string,
  apiKey?: string,
): Promise<PlaceSuggestion[]> {
  await ensureGoogleMaps(apiKey);

  if (!input.trim()) return [];

  return new Promise((resolve) => {
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: "mx" },
        fields: ["place_id", "description", "structured_formatting"],
      },
      (predictions: any[] | null, status: string) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !predictions
        ) {
          resolve([]);
          return;
        }

        resolve(
          predictions.map((prediction) => ({
            placeId: prediction.place_id,
            description: prediction.description,
            mainText:
              prediction.structured_formatting?.main_text ||
              prediction.description,
            secondaryText: prediction.structured_formatting?.secondary_text,
          })),
        );
      },
    );
  });
}

export async function getPlaceDetails(
  placeId: string,
  apiKey?: string,
): Promise<GeoPoint> {
  await ensureGoogleMaps(apiKey);

  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(
      document.createElement("div"),
    );
    service.getDetails(
      {
        placeId,
        fields: ["name", "formatted_address", "geometry", "place_id"],
      },
      (place: any, status: string) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !place?.geometry?.location
        ) {
          reject(new Error("No se pudo obtener el lugar"));
          return;
        }

        resolve({
          nombre: place.name || place.formatted_address?.split(",")[0],
          direccion: place.formatted_address || place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          placeId: place.place_id,
        } as GeoPoint);
      },
    );
  });
}

function markerIcon(color: string, label = "", scale = 1) {
  const fontSize = label.length > 2 ? 8 : 10;
  const svg = encodeURIComponent(`
    <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 41C17 41 31 25.8 31 15.8C31 7.6 24.7 1 17 1C9.3 1 3 7.6 3 15.8C3 25.8 17 41 17 41Z" fill="${color}" stroke="white" stroke-width="3"/>
      <circle cx="17" cy="16" r="10" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.78)" stroke-width="1.5"/>
      <text x="17" y="19.5" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="900" fill="white">${label}</text>
    </svg>
  `);

  return {
    url: `data:image/svg+xml;charset=UTF-8,${svg}`,
    scaledSize: new window.google.maps.Size(34 * scale, 42 * scale),
    anchor: new window.google.maps.Point(17 * scale, 41 * scale),
  };
}

function busIcon(heading = 0) {
  const svg = encodeURIComponent(`
    <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(${heading} 22 22)">
        <circle cx="22" cy="22" r="18" fill="rgba(31,97,141,0.18)"/>
        <rect x="12" y="9" width="20" height="27" rx="5" fill="#111827" stroke="white" stroke-width="2"/>
        <rect x="15" y="12" width="14" height="7" rx="2" fill="#e0f2fe"/>
        <rect x="15" y="22" width="14" height="7" rx="2" fill="#f8fafc"/>
        <rect x="10" y="15" width="3" height="8" rx="1.5" fill="#0f172a"/>
        <rect x="31" y="15" width="3" height="8" rx="1.5" fill="#0f172a"/>
        <path d="M18 35h8" stroke="#facc15" stroke-width="2" stroke-linecap="round"/>
      </g>
    </svg>
  `);

  return {
    url: `data:image/svg+xml;charset=UTF-8,${svg}`,
    scaledSize: new window.google.maps.Size(44, 44),
    anchor: new window.google.maps.Point(22, 22),
  };
}

function normalizeRoutes(routes: RutaBase[] = []) {
  return routes.map((route, index) => ({
    id: String(route.id),
    name: route.nombre,
    order: index + 1,
    color: route.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    customPath: route.waypoints?.length ? route.waypoints : null,
    points: getRoutePoints(route).map((point, pointIndex, allPoints) => ({
      ...point,
      markerRole:
        pointIndex === 0
          ? "origen"
          : pointIndex === allPoints.length - 1
            ? "destino"
            : "parada",
    })),
  }));
}

function fitMap(
  map: any,
  routes: ReturnType<typeof normalizeRoutes>,
  connections: ConnectionSegment[],
  markerPoints: NonNullable<Props["markerPoints"]>,
) {
  const bounds = new window.google.maps.LatLngBounds();
  routes.flatMap((route) => route.points).forEach((point) => bounds.extend(point));
  connections.flatMap((segment) => [segment.from, segment.to]).forEach((point) => bounds.extend(point));
  markerPoints.forEach((point) => bounds.extend(point));
  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, 56);
    return;
  }
  map.setCenter(DEFAULT_CENTER);
  map.setZoom(5);
}

function markerSlotKey(point: GeoPoint) {
  return `${point.lat.toFixed(5)}:${point.lng.toFixed(5)}`;
}

function offsetMarkerPosition(point: GeoPoint, slot: number) {
  if (slot === 0) return point;
  const angle = ((slot - 1) % 8) * (Math.PI / 4);
  const meters = 24 + Math.floor((slot - 1) / 8) * 10;
  const latOffset = (Math.cos(angle) * meters) / 111320;
  const lngOffset =
    (Math.sin(angle) * meters) /
    (111320 * Math.max(0.25, Math.cos((point.lat * Math.PI) / 180)));

  return {
    ...point,
    lat: point.lat + latOffset,
    lng: point.lng + lngOffset,
  };
}

function sampleWaypoints(path?: GeoPoint[] | null, maxWaypoints = 20) {
  if (!path || path.length <= 2) return [];
  const middle = path.slice(1, -1);
  if (middle.length <= maxWaypoints) return middle;
  const step = middle.length / maxWaypoints;
  return Array.from({ length: maxWaypoints }, (_, index) => middle[Math.floor(index * step)]);
}

function FallbackMap({ routes, height }: { routes: ReturnType<typeof normalizeRoutes>; height: number }) {
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(135deg, #f8fafc 0%, #edf7f5 48%, #f6f1e8 100%)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(31,97,141,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(31,97,141,0.08) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <Box
        component="svg"
        width="100%"
        height={height}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        sx={{ position: "absolute", inset: 0 }}
      >
        {routes.map((route, index) => (
          <polyline
            key={route.id}
            points={route.points
              .map((_, pointIndex) => `${12 + pointIndex * 76 / Math.max(route.points.length - 1, 1)},${26 + index * 14 + (pointIndex % 2) * 20}`)
              .join(" ")}
            fill="none"
            stroke={route.color}
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </Box>
      <Box sx={{ position: "absolute", left: 16, top: 16 }}>
        <Chip label="Mapa sin Google: agrega API key o revisa restricciones" size="small" />
      </Box>
    </Box>
  );
}

export default function GoogleRouteMap({
  routes = EMPTY_ROUTES,
  connections = EMPTY_CONNECTIONS,
  markerPoints = EMPTY_MARKERS,
  height = 460,
  title = "Mapa",
  editable = false,
  editingTarget = "parada",
  onMapPoint,
  onRouteMetrics,
  editableConnections = false,
  onConnectionPathChange,
  enableStreetView = false,
  enableSimulation = false,
  simulationRoute = null,
  simulationPath: simulationPathProp,
}: Readonly<Props>) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstance = React.useRef<any>(null);
  const cleanupRef = React.useRef<(() => void) | null>(null);
  const simulationCleanupRef = React.useRef<(() => void) | null>(null);
  const metricsKeyRef = React.useRef("");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const renderedRoutes = React.useMemo(() => normalizeRoutes(routes), [routes]);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error" | "missing-key">("loading");
  const [streetViewOpen, setStreetViewOpen] = React.useState(false);
  const [pendingClicks, setPendingClicks] = React.useState(0);
  const [isSimulating, setIsSimulating] = React.useState(false);
  const simulationPath = React.useMemo(() => {
    if (simulationPathProp?.length) return simulationPathProp;
    if (!simulationRoute) return [];
    return simulationRoute.waypoints?.length
      ? simulationRoute.waypoints
      : getRoutePoints(simulationRoute);
  }, [simulationPathProp, simulationRoute]);

  React.useEffect(() => {
    if (!apiKey) {
      setStatus("missing-key");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    ensureGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !mapRef.current || !window.google?.maps) return;

        const map =
          mapInstance.current ||
          new window.google.maps.Map(mapRef.current, {
            center: renderedRoutes[0]?.points[0] || DEFAULT_CENTER,
            zoom: 5,
            mapTypeControl: false,
            streetViewControl: enableStreetView,
            fullscreenControl: false,
            clickableIcons: false,
          });

        mapInstance.current = map;
        map.setOptions({
          draggableCursor: editable ? "crosshair" : undefined,
          draggingCursor: editable ? "grabbing" : undefined,
        });
        map.data.forEach((feature: any) => map.data.remove(feature));

        const markers: any[] = [];
        const polylines: any[] = [];
        const directionsRenderers: any[] = [];
        const markerSlots = new Map<string, number>();
        const nextMarkerPosition = (point: GeoPoint) => {
          const key = markerSlotKey(point);
          const slot = markerSlots.get(key) || 0;
          markerSlots.set(key, slot + 1);
          return offsetMarkerPosition(point, slot);
        };
        cleanupRef.current?.();

        renderedRoutes.forEach((route) => {
          route.points.forEach((point, index) => {
            const pointColor = point.markerRole === "parada" ? STOP_COLOR : route.color;
            const labelText =
              point.markerRole === "origen"
                ? `O${route.order}`
                : point.markerRole === "destino"
                  ? `D${route.order}`
                  : `P${index}`;
            markers.push(
              new window.google.maps.Marker({
                map,
                position: nextMarkerPosition(point),
                title: point.nombre,
                icon: markerIcon(pointColor, labelText, index === 0 || index === route.points.length - 1 ? 1 : 0.86),
                zIndex: point.markerRole === "parada" ? 710 : 720,
              }),
            );
          });

          if (!editable && route.customPath && route.customPath.length >= 2) {
            polylines.push(
              new window.google.maps.Polyline({
                map,
                path: route.customPath,
                strokeColor: route.color,
                strokeOpacity: 0.95,
                strokeWeight: 5,
              }),
            );
          } else if (route.points.length >= 2) {
            const directions = new window.google.maps.DirectionsService();
            const renderer = new window.google.maps.DirectionsRenderer({
              map,
              suppressMarkers: true,
              preserveViewport: true,
              draggable: editable,
              polylineOptions: {
                strokeColor: route.color,
                strokeOpacity: 0.95,
                strokeWeight: 5,
              },
            });
            directionsRenderers.push(renderer);
            const publishMetrics = (result: any) => {
              if (!result?.routes?.[0]) return;
              const legs = result.routes[0].legs || [];
              const nextMetrics = {
                distanciaMetros: legs.reduce((sum: number, leg: any) => sum + (leg.distance?.value || 0), 0),
                duracionSegundos: legs.reduce((sum: number, leg: any) => sum + (leg.duration?.value || 0), 0),
                overviewPath: result.routes[0].overview_path.map((point: any) => ({
                  nombre: "Punto de trazo",
                  direccion: "Polyline de Google Maps",
                  lat: point.lat(),
                  lng: point.lng(),
                })),
              };
              const metricsKey = `${nextMetrics.distanciaMetros}:${nextMetrics.duracionSegundos}:${nextMetrics.overviewPath.length}`;
              if (metricsKeyRef.current !== metricsKey) {
                metricsKeyRef.current = metricsKey;
                onRouteMetrics?.(nextMetrics);
              }
            };
            directions.route(
              {
                origin: route.points[0],
                destination: route.points[route.points.length - 1],
                waypoints: route.points.slice(1, -1).map((point) => ({
                  location: point,
                  stopover: true,
                })),
                travelMode: window.google.maps.TravelMode.DRIVING,
                provideRouteAlternatives: false,
              },
              (result: any, resultStatus: string) => {
                if (resultStatus !== "OK" || !result?.routes?.[0]) {
                  polylines.push(
                    new window.google.maps.Polyline({
                      map,
                      path: route.points,
                      strokeColor: route.color,
                      strokeOpacity: 0.95,
                      strokeWeight: 5,
                    }),
                  );
                  return;
                }

                renderer.setDirections(result);
                publishMetrics(result);
                if (editable) {
                  const dragListener = renderer.addListener("directions_changed", () => {
                    publishMetrics(renderer.getDirections());
                  });
                  directionsRenderers.push({ setMap: () => dragListener.remove() });
                }
              },
            );
          }
        });

        markerPoints.forEach((point, index) => {
          const color = point.markerRole === "parada" ? STOP_COLOR : ORIGIN_DESTINATION_COLOR;
          const labelText =
            point.markerRole === "origen"
              ? "O"
              : point.markerRole === "destino"
                ? "D"
                : `P${index + 1}`;
          markers.push(
            new window.google.maps.Marker({
              map,
              position: nextMarkerPosition(point),
              title: point.nombre,
              icon: markerIcon(color, labelText, point.markerRole === "parada" ? 0.86 : 1),
              zIndex: point.markerRole === "parada" ? 710 : 720,
            }),
          );
        });

        connections.forEach((segment, index) => {
          const publishConnection = (result: any) => {
            if (!result?.routes?.[0]) return;
            const legs = result.routes[0].legs || [];
            const path = result.routes[0].overview_path.map((point: any) => ({
              nombre: "Punto de enlace",
              direccion: "Conexion operativa",
              lat: point.lat(),
              lng: point.lng(),
            }));
            const distanceMeters = legs.reduce(
              (sum: number, leg: any) => sum + (leg.distance?.value || 0),
              0,
            );
            onConnectionPathChange?.(segment.id, path, distanceMeters);
          };

          if (segment.path?.length && !editableConnections) {
            polylines.push(
              new window.google.maps.Polyline({
                map,
                path: segment.path,
                strokeColor: "#2d3748",
                strokeOpacity: 0,
                icons: [
                  {
                    icon: { path: "M 0,-1 0,1", strokeOpacity: 0.9, scale: 3 },
                    offset: "0",
                    repeat: "16px",
                  },
                ],
              }),
            );
          } else {
            const directions = new window.google.maps.DirectionsService();
            const renderer = new window.google.maps.DirectionsRenderer({
              map,
              suppressMarkers: true,
              preserveViewport: true,
              draggable: editableConnections,
              polylineOptions: {
                strokeColor: "#2d3748",
                strokeOpacity: 0,
                strokeWeight: 4,
                icons: [
                  {
                    icon: { path: "M 0,-1 0,1", strokeOpacity: 0.9, scale: 3 },
                    offset: "0",
                    repeat: "16px",
                  },
                ],
              },
            });
            directionsRenderers.push(renderer);
            directions.route(
              {
                origin: segment.from,
                destination: segment.to,
                waypoints: sampleWaypoints(segment.path).map((point) => ({
                  location: point,
                  stopover: false,
                })),
                travelMode: window.google.maps.TravelMode.DRIVING,
              },
              (result: any, resultStatus: string) => {
                if (resultStatus !== "OK" || !result?.routes?.[0]) {
                  polylines.push(
                    new window.google.maps.Polyline({
                      map,
                      path: [segment.from, segment.to],
                      strokeColor: "#2d3748",
                      strokeOpacity: 0,
                      icons: [
                        {
                          icon: { path: "M 0,-1 0,1", strokeOpacity: 0.9, scale: 3 },
                          offset: "0",
                          repeat: "16px",
                        },
                      ],
                    }),
                  );
                  return;
                }

                renderer.setDirections(result);
                publishConnection(result);
                if (editableConnections) {
                  const dragListener = renderer.addListener("directions_changed", () => {
                    publishConnection(renderer.getDirections());
                  });
                  directionsRenderers.push({ setMap: () => dragListener.remove() });
                }
              },
            );
          }
          markers.push(
            new window.google.maps.Marker({
              map,
              position: nextMarkerPosition(segment.from),
              title: `Enlace ${index + 1}: salida`,
              icon: markerIcon("#2d3748", `E${index + 1}`, 0.78),
              zIndex: 690,
            }),
          );
        });

        fitMap(map, renderedRoutes, connections, markerPoints);

        const listener = editable
          ? map.addListener("click", (event: any) => {
              const lat = event.latLng.lat();
              const lng = event.latLng.lng();
              const clientId = `map-${Date.now()}-${Math.round(lat * 100000)}-${Math.round(lng * 100000)}`;
              const point: GeoPoint = {
                nombre:
                  editingTarget === "origen"
                    ? "Origen marcado"
                    : editingTarget === "destino"
                      ? "Destino marcado"
                      : "Parada marcada",
                direccion: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                lat,
                lng,
                clientId,
                isResolving: true,
              };

              onMapPoint?.(point, editingTarget);
              setPendingClicks((current) => current + 1);

              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: { lat, lng } }, (results: any[], geocodeStatus: string) => {
                const resolvedPoint =
                  geocodeStatus === "OK" && results?.[0]
                    ? {
                        ...point,
                        direccion: results[0].formatted_address,
                        nombre: results[0].formatted_address.split(",")[0],
                        placeId: results[0].place_id,
                        isResolving: false,
                      }
                    : { ...point, isResolving: false };

                onMapPoint?.(
                  resolvedPoint,
                  editingTarget,
                  { replaceClientId: clientId },
                );
                setPendingClicks((current) => Math.max(0, current - 1));
              });
            })
          : null;

        setStatus("ready");

        cleanupRef.current = () => {
          listener?.remove();
          markers.forEach((marker) => marker.setMap(null));
          polylines.forEach((line) => line.setMap(null));
          directionsRenderers.forEach((renderer) => renderer.setMap(null));
        };
      })
      .catch(() => setStatus("error"));

    return () => {
      cancelled = true;
      cleanupRef.current?.();
    };
  }, [apiKey, connections, editable, editableConnections, editingTarget, enableStreetView, markerPoints, onConnectionPathChange, onMapPoint, onRouteMetrics, renderedRoutes]);

  React.useEffect(() => {
    simulationCleanupRef.current?.();
    const map = mapInstance.current;
    if (!map || !window.google?.maps || !enableSimulation || simulationPath.length <= 1) {
      simulationCleanupRef.current = null;
      return;
    }

    let step = 0;
    let interval: number | null = null;
    const marker = new window.google.maps.Marker({
      map,
      position: simulationPath[0],
      title: "Autobus en recorrido",
      icon: busIcon(0),
      zIndex: 999,
    });

    if (isSimulating) {
      interval = window.setInterval(() => {
        step = (step + 1) % simulationPath.length;
        const current = simulationPath[step];
        const previous = simulationPath[Math.max(0, step - 1)];
        const heading =
          Math.atan2(current.lng - previous.lng, current.lat - previous.lat) *
          (180 / Math.PI);
        marker.setPosition(current);
        marker.setIcon(busIcon(heading));
      }, 130);
    }

    simulationCleanupRef.current = () => {
      if (interval) window.clearInterval(interval);
      marker.setMap(null);
    };

    return () => {
      simulationCleanupRef.current?.();
      simulationCleanupRef.current = null;
    };
  }, [enableSimulation, isSimulating, simulationPath]);

  const focusStreetView = () => {
    const map = mapInstance.current;
    const point = renderedRoutes[0]?.points[0];
    if (!map || !point || !window.google?.maps) return;
    const panorama = map.getStreetView();
    panorama.setPosition(point);
    panorama.setPov({ heading: 34, pitch: 0 });
    panorama.setVisible(!streetViewOpen);
    setStreetViewOpen(!streetViewOpen);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height,
        minHeight: 340,
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.default",
      }}
    >
      <Box ref={mapRef} sx={{ width: "100%", height: "100%" }} />
      {(status === "error" || status === "missing-key") && (
        <FallbackMap routes={renderedRoutes} height={height} />
      )}
      {status === "loading" && (
        <Chip
          label="Cargando Google Maps..."
          size="small"
          sx={{
            position: "absolute",
            left: 16,
            top: 16,
            backgroundColor: "rgba(255,255,255,0.94)",
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.12)",
          }}
        />
      )}

      <Box
        sx={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 1,
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            maxWidth: 420,
            p: 1.5,
            borderRadius: "8px",
            backgroundColor: "rgba(255,255,255,0.94)",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.18)",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {editable
              ? renderedRoutes.length > 0
                ? "Arrastra la linea de la ruta para ajustar el camino. Haz clic en el mapa solo para agregar puntos."
                : "Busca una direccion o haz clic en el mapa segun el modo activo."
              : "Cada ruta conserva su color en trazo y pines para distinguir recorridos."}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ pointerEvents: "auto", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {editable && (
            <Chip
              icon={<AddLocationAltIcon />}
              label={`Click en mapa: ${editingTarget.toUpperCase()}`}
              color="primary"
              sx={{ backgroundColor: "rgba(255,255,255,0.94)" }}
            />
          )}
          {pendingClicks > 0 && (
            <Chip
              label="Resolviendo direccion..."
              color="info"
              sx={{ backgroundColor: "rgba(255,255,255,0.94)" }}
            />
          )}
          {connections.map((segment) => (
            <Chip
              key={segment.id}
              label={`Enlace ${formatMeters(segment.distanceMeters)}`}
              color="warning"
              sx={{ backgroundColor: "rgba(255,255,255,0.94)" }}
            />
          ))}
          {enableStreetView && (
            <Button
              size="small"
              variant="contained"
              startIcon={<StreetviewIcon />}
              onClick={focusStreetView}
            >
              Street View
            </Button>
          )}
          {enableSimulation && simulationPath.length > 1 && (
            <Button
              size="small"
              variant="contained"
              color={isSimulating ? "secondary" : "primary"}
              startIcon={isSimulating ? <PauseIcon /> : <PlayArrowIcon />}
              onClick={() => setIsSimulating((current) => !current)}
            >
              {isSimulating ? "Pausa" : "Simular"}
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
