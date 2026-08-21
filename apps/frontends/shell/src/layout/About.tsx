"use client";

import { ArrowBack } from "@mui/icons-material";
import {
  useTheme,
  Box,
  Typography,
  Button,
  Backdrop,
  CircularProgress,
  Grid,
  Alert,
} from "@mui/material";
import {
  CenteredDiv,
  EmptyState,
  MotionPaper,
} from "@nexoroute/commons";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";
import useInstitucion from "../core/hooks/useInstitucion";
import dynamic from "next/dynamic";

type Props = {};

export default function About({}: Props) {
  const [list, setList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { getAll } = useInstitucion();
  const router = useRouter();

  const [error, setError] = React.useState<string | null>(
    null,
  );

  const doFetch = async () => {
    try {
      setLoading(true);
      const data = await getAll();
      setList(data);
    } catch (error) {
      console.error("Error fetching instituciones:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error desconocido",
      );
    }
    setLoading(false);
  };

  React.useEffect(() => {
    doFetch();
  }, []);

  const doNothing = () => {
    // This function intentionally does nothing
  };

  if (loading)
    return (
      <Backdrop
        sx={(theme) => ({
          color: theme.palette.text.primary,
          zIndex: theme.zIndex.drawer + 1,
        })}
        open
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );

  if (error) {
    return (
      <Box sx={{ margin: "auto" }}>
        <EmptyState
          title="Ocurrió un error"
          description={error ?? "Error desconocido"}
          variant="error"
          action={{
            label: "Ir a inicio",
            onClick() {
              router.replace("/");
            },
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      component={"main"}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        minHeight: "100dvh",
        scrollbarColor: "transparent transparent",
        position: "relative",
      }}
    >
      <Header />
      <Box
        sx={{
          maxWidth: "1400px",
          display: "flex",
          flexDirection: "column",
          height: "fit-content",
          margin: "0 auto",
          gap: "12px",
          width: "100%",
          position: "relative",
          padding: "16px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: {
              xs: "center",
              md: "space-between",
            },
            width: "100%",
          }}
        >
          <Typography variant="h4" className="font-brand">
            Nuestros servicios
          </Typography>
          <Button onClick={() => router.push("/")}>
            Comprar boletos
          </Button>
        </Box>
        <Typography
          variant="body2"
          sx={{ textAlign: "justify" }}
          color="textSecondary"
        >
          En Nexoroute, nos dedicamos a ofrecer una
          experiencia de viaje excepcional. Nuestros
          servicios están diseñados para facilitar cada
          etapa de tu viaje, desde la planificación hasta la
          llegada a tu destino. Con un enfoque en la
          comodidad, seguridad y eficiencia, nos aseguramos
          de que cada viaje sea memorable y sin
          complicaciones. Descubre cómo nuestros servicios
          pueden mejorar tu experiencia de viaje y hacer que
          cada momento cuente.
        </Typography>
        <ServicioCards disabledFunction={doNothing} />
        <Typography variant="h4" className="font-brand">
          Nuestra línea de autobuses
        </Typography>
        <Typography
          variant="body2"
          sx={{ textAlign: "justify" }}
          color="textSecondary"
        >
          Por un mejor servicio de movilidad, comodidad y
          seguridad;Nexoroute pone a tu disposición
          diferentes líneas de autobuses con nuestros socios
          que te llevaran a tu próximo destino.
          <br />
          Busca cualquier viaje desde el sitio o App y elige
          la marca que más te interese.
        </Typography>
        {list.length === 0 ? (
          <EmptyState
            title="No hay instituciones disponibles"
            variant="no-data"
          />
        ) : (
          <Box sx={{ width: "100%" }}>
            <Grid container spacing={2}>
              {list.map((item, index) => (
                <Grid
                  key={index + 1}
                  size={{ xs: 12, sm: 6, md: 3, lg: 2, xl: 1.5 }}
                  sx={{
                    position: "relative",
                    aspectRatio: "4 / 3", // o la proporción que uses típicamente
                    width: "100%",
                  }}
                >
                  <Image
                    fill
                    style={{ objectFit: "cover" }}
                    src={item.imagen_url}
                    alt={item.nombre}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
}

const Header = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const router = useRouter();
  return (
    <MotionPaper sx={{ p: 2, width: "100%" }}>
      <Box
        sx={{
          maxWidth: "1400px",
          width: "100%",
          mx: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
          }}
        >
          <Image
            src={
              isDark
                ? "/assets/logo_white_sf.png"
                : "/assets/logo_black_sf.png"
            }
            alt="logo"
            style={{
              width: 75,
              height: 50,
              objectFit: "contain",
            }}
            width={75}
            height={50}
          />
          <Box
            sx={{
              display: "flex",
              gap: 0,
              flexDirection: "column",
            }}
          >
            <Typography
              variant="subtitle2"
              className="font-brand"
              sx={{ margin: 0 }}
            >
              Nexoroute
            </Typography>
            <Typography variant="caption">
              Viaja mejor
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => router.back()}
          size="small"
          startIcon={<ArrowBack />}
        >
          Volver
        </Button>
      </Box>
    </MotionPaper>
  );
};

const ServicioCards = dynamic(
  async () => {
    try {
      const { loadRemote } =
        await import("@module-federation/enhanced/runtime");

      const mod = await loadRemote<Record<string, any>>(
        "catalogos/ServiciosModule",
      );
      const Component = mod?.["ServiciosCardPage"] as
        | React.ComponentType<any>
        | undefined;
      if (!Component) {
        throw new Error(
          `catalogos/ServiciosModule no expone ServiciosCardPage. Exportaciones: ${Object.keys(mod ?? {}).join(", ") || "ninguna"}`,
        );
      }
      return { default: Component };
    } catch (error) {
      console.error(
        "[Inicio] No se pudo cargar ServiciosCardPage desde catalogos/ServiciosModule",
        error,
      );
      return {
        default: () => (
          <Alert severity="error">
            Error al cargar el componente
          </Alert>
        ),
      };
    }
  },
  {
    ssr: false,
    loading: () => (
      <CenteredDiv>
        <CircularProgress />
      </CenteredDiv>
    ),
  },
);
