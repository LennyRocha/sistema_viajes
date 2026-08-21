"use client";
import {
  Alert,
  CircularProgress,
  Box,
  IconButton,
  ImageListItem,
  ImageListItemBar,
  Tooltip,
} from "@mui/material";
import React from "react";
import { CenteredDiv } from "@nexoroute/commons";
import {
  ConfirmationNumber,
  Map,
} from "@mui/icons-material";
import slugify from "slugify";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";
const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const DEFAULT_VIAJE_IMAGE = "/imagen_defecto_viajes.jpg";

export default function RutasCarrusel({
  disabledFunction,
  router,
}: Readonly<{
  disabledFunction: (disabled: boolean) => void;
  router: any;
}>) {
  const [rutas, setRutas] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const getImageUrl = async (placeId) => {
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
          headers: {
            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY!,
            "X-Goog-FieldMask": "photos",
          },
        },
      );
      if (!res.ok) {
        return DEFAULT_VIAJE_IMAGE;
      }
      const data = await res.json();
      return data.photos?.[0]?.name || DEFAULT_VIAJE_IMAGE;
    } catch (error) {
      console.error(
        `Error fetching image for placeId ${placeId}:`,
        error,
      );
      return DEFAULT_VIAJE_IMAGE;
    }
  };
  const fetchRutas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/rutas`);
      if (!res.ok) {
        setRutas([]);
        return;
      }
      const data = await res.json();
      const list = await Promise.all(
        data.map(async (ruta) => {
          const imageUrl = await getImageUrl(
            ruta.destino.placeId,
          );
          return { ...ruta, img: imageUrl };
        }),
      );
      setRutas(list);
      setIsError(false);
    } catch {
      setRutas([]);
      disabledFunction(false);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };
  React.useEffect(() => {
    fetchRutas();
  }, []);
  React.useEffect(() => {
    if (rutas) {
      disabledFunction(rutas.length === 0);
    }
  }, [rutas, disabledFunction]);
  if (isLoading) {
    return (
      <CenteredDiv>
        <CircularProgress />
      </CenteredDiv>
    );
  }
  if (isError) {
    return (
      <Alert severity="error">
        Error al cargar las rutas disponibles. Por favor,
        inténtalo de nuevo más tarde.
      </Alert>
    );
  }
  if (rutas.length === 0) {
    return (
      <Alert severity="info">
        No hay rutas disponibles en este momento. Por favor,
        inténtalo de nuevo más tarde.
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        gap: "8px",
        height: "100%",
      }}
    >
      {rutas.map((item) => (
        <ImageListItem
          key={item.id}
          sx={{ width: "max(25vw, 300px)" }}
        >
          <img
            srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
            src={`${item.img}?w=248&fit=crop&auto=format`}
            alt={item.nombre}
            loading="lazy"
          />
          <ImageListItemBar
            title={item.nombre}
            subtitle={item.descripcion}
            actionIcon={
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  alignItems: "center",
                  width: "fit-content",
                }}
              >
                <Tooltip title="Ver viajes">
                  <IconButton
                    color="default"
                    aria-label={`info about ${item.nombre}`}
                    onClick={() =>
                      router.push(
                        `/viajes/${slugify(item.nombre, { lower: true })}`,
                      )
                    }
                  >
                    <ConfirmationNumber />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
        </ImageListItem>
      ))}
    </Box>
  );
}
