"use client";

import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
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
  enableStreetView?: boolean;
};

const DEFAULT_CENTER = { lat: 23.6345, lng: -102.5528 };
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

function markerIcon(color: string, scale = 1) {
  const svg = encodeURIComponent(`
    <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 41C17 41 31 25.8 31 15.8C31 7.6 24.7 1 17 1C9.3 1 3 7.6 3 15.8C3 25.8 17 41 17 41Z" fill="${color}" stroke="white" stroke-width="3"/>
      <circle cx="17" cy="16" r="5.5" fill="white"/>
    </svg>
  `);

  return {
    url: `data:image/svg+xml;charset=UTF-8,${svg}`,
    scaledSize: new window.google.maps.Size(34 * scale, 42 * scale),
    anchor: new window.google.maps.Point(17 * scale, 41 * scale),
  };
}

function normalizeRoutes(routes: RutaBase[] = []) {
  return routes.map((route, index) => ({
    id: String(route.id),
    name: route.nombre,
    color: route.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
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
  routes = [],
  connections = [],
  markerPoints = [],
  height = 460,
  title = "Mapa",
  editable = false,
  editingTarget = "parada",
  onMapPoint,
  onRouteMetrics,
  enableStreetView = false,
}: Readonly<Props>) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstance = React.useRef<any>(null);
  const cleanupRef = React.useRef<(() => void) | null>(null);
  const metricsKeyRef = React.useRef("");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const renderedRoutes = React.useMemo(() => normalizeRoutes(routes), [routes]);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error" | "missing-key">("loading");
  const [streetViewOpen, setStreetViewOpen] = React.useState(false);
  const [pendingClicks, setPendingClicks] = React.useState(0);

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
        cleanupRef.current?.();

        renderedRoutes.forEach((route) => {
          route.points.forEach((point, index) => {
            const pointColor = point.markerRole === "parada" ? STOP_COLOR : route.color;
            markers.push(
              new window.google.maps.Marker({
                map,
                position: point,
                title: point.nombre,
                icon: markerIcon(pointColor, index === 0 || index === route.points.length - 1 ? 1 : 0.82),
                label: {
                  text: String(index + 1),
                  color: pointColor,
                  fontWeight: "900",
                  fontSize: "11px",
                },
              }),
            );
          });

          if (route.points.length >= 2) {
            const directions = new window.google.maps.DirectionsService();
            const renderer = new window.google.maps.DirectionsRenderer({
              map,
              suppressMarkers: true,
              preserveViewport: true,
              polylineOptions: {
                strokeColor: route.color,
                strokeOpacity: 0.95,
                strokeWeight: 5,
              },
            });
            directionsRenderers.push(renderer);
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
              },
            );
          }
        });

        markerPoints.forEach((point, index) => {
          const color = point.markerRole === "parada" ? STOP_COLOR : ORIGIN_DESTINATION_COLOR;
          markers.push(
            new window.google.maps.Marker({
              map,
              position: point,
              title: point.nombre,
              icon: markerIcon(color, point.markerRole === "parada" ? 0.84 : 1),
              label: {
                text:
                  point.markerRole === "origen"
                    ? "O"
                    : point.markerRole === "destino"
                      ? "D"
                      : String(index + 1),
                color,
                fontWeight: "900",
                fontSize: "11px",
              },
            }),
          );
        });

        connections.forEach((segment) => {
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
  }, [apiKey, connections, editable, editingTarget, enableStreetView, markerPoints, onMapPoint, onRouteMetrics, renderedRoutes]);

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
      {status !== "ready" && <FallbackMap routes={renderedRoutes} height={height} />}

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
              ? "Busca una direccion o haz clic en el mapa segun el modo activo."
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
        </Stack>
      </Box>
    </Box>
  );
}
