"use client";

import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GeoPoint from "../types/GeoPoint";
import RutaBase from "../types/RutaBase";
import {
  ConnectionSegment,
  formatMeters,
  getRoutePoints,
} from "../utils/routeUtils";

declare global {
  interface Window {
    google?: any;
    __nexorouteGoogleMapsPromise?: Promise<void>;
  }
}

type Props = {
  points?: GeoPoint[];
  routes?: RutaBase[];
  connections?: ConnectionSegment[];
  height?: number;
  title?: string;
};

const DEFAULT_CENTER = { lat: 18.9242, lng: -99.2216 };
const FALLBACK_COLORS = ["#1f618d", "#b7791f", "#6b46c1", "#2f855a"];

function loadGoogleMaps(apiKey: string) {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (window.__nexorouteGoogleMapsPromise) {
    return window.__nexorouteGoogleMapsPromise;
  }

  window.__nexorouteGoogleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
    document.head.appendChild(script);
  });

  return window.__nexorouteGoogleMapsPromise;
}

function normalizeRoutes(points: GeoPoint[] = [], routes: RutaBase[] = []) {
  if (routes.length > 0) {
    return routes.map((route, index) => ({
      id: String(route.id),
      name: route.nombre,
      color: route.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      points: getRoutePoints(route),
    }));
  }

  return [
    {
      id: "preview",
      name: "Ruta seleccionada",
      color: FALLBACK_COLORS[0],
      points,
    },
  ].filter((route) => route.points.length > 0);
}

function getBounds(routes: ReturnType<typeof normalizeRoutes>, connections: ConnectionSegment[]) {
  const allPoints = [
    ...routes.flatMap((route) => route.points),
    ...connections.flatMap((segment) => [segment.from, segment.to]),
  ];

  if (allPoints.length === 0) return null;

  return allPoints.reduce(
    (bounds, point) => ({
      minLat: Math.min(bounds.minLat, point.lat),
      maxLat: Math.max(bounds.maxLat, point.lat),
      minLng: Math.min(bounds.minLng, point.lng),
      maxLng: Math.max(bounds.maxLng, point.lng),
    }),
    {
      minLat: allPoints[0].lat,
      maxLat: allPoints[0].lat,
      minLng: allPoints[0].lng,
      maxLng: allPoints[0].lng,
    },
  );
}

function projectPoint(point: GeoPoint, bounds: NonNullable<ReturnType<typeof getBounds>>) {
  const latRange = Math.max(bounds.maxLat - bounds.minLat, 0.01);
  const lngRange = Math.max(bounds.maxLng - bounds.minLng, 0.01);

  return {
    x: 8 + ((point.lng - bounds.minLng) / lngRange) * 84,
    y: 92 - ((point.lat - bounds.minLat) / latRange) * 84,
  };
}

function FallbackMap({
  routes,
  connections,
  height,
}: {
  routes: ReturnType<typeof normalizeRoutes>;
  connections: ConnectionSegment[];
  height: number;
}) {
  const bounds = getBounds(routes, connections);

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #edf7f5 38%, #f6f1e8 100%)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(31,97,141,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(31,97,141,0.08) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
      <svg
        width="100%"
        height={height}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0 }}
      >
        {bounds &&
          connections.map((segment) => {
            const from = projectPoint(segment.from, bounds);
            const to = projectPoint(segment.to, bounds);
            return (
              <line
                key={segment.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#2d3748"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        {bounds &&
          routes.map((route) => (
            <polyline
              key={route.id}
              points={route.points
                .map((point) => {
                  const projected = projectPoint(point, bounds);
                  return `${projected.x},${projected.y}`;
                })
                .join(" ")}
              fill="none"
              stroke={route.color}
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
      </svg>
      {bounds &&
        routes.flatMap((route) =>
          route.points.map((point, index) => {
            const projected = projectPoint(point, bounds);
            const isEdge = index === 0 || index === route.points.length - 1;
            return (
              <Box
                key={`${route.id}-${point.nombre}-${index}`}
                title={point.nombre}
                sx={{
                  position: "absolute",
                  left: `${projected.x}%`,
                  top: `${projected.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: isEdge ? 18 : 12,
                  height: isEdge ? 18 : 12,
                  borderRadius: "50%",
                  backgroundColor: route.color,
                  border: "2px solid white",
                  boxShadow: "0 6px 14px rgba(15, 23, 42, 0.2)",
                }}
              />
            );
          }),
        )}
      <Box
        sx={{
          position: "absolute",
          left: 16,
          top: 16,
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Chip
          icon={<AltRouteIcon />}
          label="Preview operativo"
          size="small"
          sx={{ backgroundColor: "rgba(255,255,255,0.9)" }}
        />
        {connections.length > 0 && (
          <Chip
            label={`${connections.length} enlace(s)`}
            size="small"
            color="warning"
            sx={{ backgroundColor: "rgba(255,255,255,0.9)" }}
          />
        )}
      </Box>
    </Box>
  );
}

export default function GoogleRouteMap({
  points = [],
  routes = [],
  connections = [],
  height = 420,
  title = "Mapa operativo",
}: Readonly<Props>) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const renderedRoutes = React.useMemo(
    () => normalizeRoutes(points, routes),
    [points, routes],
  );
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "ready" | "error" | "missing-key"
  >("idle");

  React.useEffect(() => {
    if (!apiKey) {
      setStatus("missing-key");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !mapRef.current || !window.google?.maps) return;

        const map = new window.google.maps.Map(mapRef.current, {
          center: renderedRoutes[0]?.points[0] || DEFAULT_CENTER,
          zoom: 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
          ],
        });

        const bounds = new window.google.maps.LatLngBounds();

        renderedRoutes.forEach((route) => {
          const path = route.points.map((point) => ({
            lat: point.lat,
            lng: point.lng,
          }));

          route.points.forEach((point, index) => {
            const position = { lat: point.lat, lng: point.lng };
            bounds.extend(position);
            new window.google.maps.Marker({
              map,
              position,
              title: point.nombre,
              label: {
                text: String(index + 1),
                color: "#ffffff",
                fontWeight: "700",
              },
            });
          });

          new window.google.maps.Polyline({
            map,
            path,
            strokeColor: route.color,
            strokeOpacity: 0.95,
            strokeWeight: 5,
          });
        });

        connections.forEach((segment) => {
          const from = { lat: segment.from.lat, lng: segment.from.lng };
          const to = { lat: segment.to.lat, lng: segment.to.lng };
          bounds.extend(from);
          bounds.extend(to);
          new window.google.maps.Polyline({
            map,
            path: [from, to],
            strokeColor: "#2d3748",
            strokeOpacity: 0,
            icons: [
              {
                icon: {
                  path: "M 0,-1 0,1",
                  strokeOpacity: 0.9,
                  scale: 3,
                },
                offset: "0",
                repeat: "16px",
              },
            ],
          });
        });

        if (!bounds.isEmpty()) map.fitBounds(bounds, 56);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));

    return () => {
      cancelled = true;
    };
  }, [apiKey, renderedRoutes, connections]);

  const showFallback = status !== "ready";

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height,
        minHeight: 320,
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.default",
      }}
    >
      <Box ref={mapRef} sx={{ width: "100%", height: "100%" }} />
      {showFallback && (
        <FallbackMap
          routes={renderedRoutes}
          connections={connections}
          height={height}
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
            maxWidth: 360,
            p: 1.5,
            borderRadius: "8px",
            backgroundColor: "rgba(255,255,255,0.92)",
            boxShadow: "0 10px 28px rgba(15, 23, 42, 0.16)",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {status === "missing-key" &&
              "Sin API key: se muestra una maqueta geografica local."}
            {status === "loading" && "Cargando Google Maps..."}
            {status === "error" &&
              "Google Maps no cargo; revisa la key o sus restricciones."}
            {status === "ready" &&
              "Google Maps activo con rutas y enlaces operativos."}
            {status === "idle" && "Preparando mapa..."}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
          {connections.map((segment) => (
            <Chip
              key={segment.id}
              icon={<LocationOnIcon />}
              label={`Enlace ${formatMeters(segment.distanceMeters)}`}
              size="small"
              color="warning"
              sx={{ backgroundColor: "rgba(255,255,255,0.94)" }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
