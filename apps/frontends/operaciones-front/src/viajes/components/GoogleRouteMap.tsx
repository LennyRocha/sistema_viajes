"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import GeoPoint from "../types/GeoPoint";

declare global {
  interface Window {
    google?: any;
    __nexorouteGoogleMapsPromise?: Promise<void>;
  }
}

type Props = {
  points: GeoPoint[];
};

const DEFAULT_CENTER = { lat: 18.9242, lng: -99.2216 };

function loadGoogleMaps(apiKey: string) {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (window.__nexorouteGoogleMapsPromise) {
    return window.__nexorouteGoogleMapsPromise;
  }

  window.__nexorouteGoogleMapsPromise = new Promise(
    (resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("No se pudo cargar Google Maps"));
      document.head.appendChild(script);
    },
  );

  return window.__nexorouteGoogleMapsPromise;
}

export default function GoogleRouteMap({ points }: Readonly<Props>) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
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
        if (cancelled || !mapRef.current || !window.google?.maps) {
          return;
        }

        const map = new window.google.maps.Map(mapRef.current, {
          center: points[0] || DEFAULT_CENTER,
          zoom: 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const bounds = new window.google.maps.LatLngBounds();

        points.forEach((point, index) => {
          const position = { lat: point.lat, lng: point.lng };
          bounds.extend(position);

          new window.google.maps.Marker({
            map,
            position,
            label: String(index + 1),
            title: point.nombre,
          });
        });

        if (points.length > 1) {
          new window.google.maps.Polyline({
            map,
            path: points.map((point) => ({
              lat: point.lat,
              lng: point.lng,
            })),
            strokeColor: "#1f618d",
            strokeOpacity: 0.9,
            strokeWeight: 4,
          });
          map.fitBounds(bounds);
        }

        setStatus("ready");
      })
      .catch(() => setStatus("error"));

    return () => {
      cancelled = true;
    };
  }, [apiKey, points]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: 320,
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.default",
      }}
    >
      <Box ref={mapRef} sx={{ width: "100%", height: 320 }} />
      {status !== "ready" && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
            textAlign: "center",
            backgroundColor: "background.paper",
          }}
        >
          <Typography variant="body2" color="textSecondary">
            {status === "missing-key" &&
              "Agrega NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para ver el mapa."}
            {status === "loading" && "Cargando mapa..."}
            {status === "error" &&
              "No se pudo cargar Google Maps. Revisa la API key y sus restricciones."}
            {status === "idle" && "Preparando mapa..."}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
