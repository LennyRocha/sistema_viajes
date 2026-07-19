"use client";
import { Menu } from "@mui/icons-material";
import {
  Box,
  Typography,
  useTheme,
  alpha,
  Button,
  Link,
  useMediaQuery,
  IconButton,
  TextField,
  Tabs,
  Tab,
} from "@mui/material";
import { MotionPaper } from "@nexoroute/commons";
import {
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import Image from "next/image";
import "@/src/css/landing.css";
import { useRouter } from "next/navigation";
import React from "react";

const MotionText = motion.create(Typography);

export default function Page() {
  const theme = useTheme();
  const isDesktopScreen = useMediaQuery(
    "(min-width: 1084px)",
  );
  const ref = React.useRef<HTMLElement>(null);

  const refs = React.useRef({
    hero: null as HTMLDivElement | null,
    search: null as HTMLDivElement | null,
    navbar: null as HTMLDivElement | null,
  });

  const scrollToRef = (name: keyof typeof refs.current) => {
    const element = refs.current[name];
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", "-25%"],
  );
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
      <Box
        ref={ref}
        component={"section"}
        id="hero"
        sx={{
          position: "relative",
          width: "100%",
          flexShrink: 0,
        }}
      >
        <Hero />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `
              linear-gradient(to right, ${alpha(theme.palette.secondary.main, 0.75)}, ${alpha(theme.palette.secondary.main, 0.5)}, rgba(0, 0, 0, 0))
            `,
            "@media (max-width: 1084px)": {
              background: `
                linear-gradient(to top, ${alpha(theme.palette.secondary.main, 0.75)}, ${alpha(theme.palette.secondary.main, 0.5)}, rgba(0, 0, 0, 0))
              `,
            },
          }}
        />
        <Box
          sx={{
            maxWidth: "1400px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            margin: "0 auto",
            gap: "8px",
            width: "100%",
            position: "relative",
            justifyContent: "space-between",
            alignItems: "start",
            padding: "16px",
            zIndex: 1,
            "@media (max-width: 1084px)": {
              paddingBottom: "calc(220px - 16px)",
            },
          }}
        >
          <Nav />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              "@media (min-width: 1084px)": {
                alignItems: "flex-start",
                textAlign: "left",
                width: "50%",
              },
              width: "100%",
            }}
          >
            <MotionText
              variant="h1"
              className="font-headings"
              sx={{
                "  @media screen and (min-width: 0px)": {
                  fontSize: "46px",
                },
                "@media screen and (min-width: 768px)": {
                  fontSize: "62px",
                },
                "@media screen and (min-width: 1400px)": {
                  fontSize: "66px",
                },
                "@media screen and (min-width: 1605px)": {
                  fontSize: "86px",
                },
                padding: "6px 0",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "white",
              }}
              style={{ y }}
              initial={
                isDesktopScreen ? { x: 40 } : { y: 40 }
              }
              animate={
                isDesktopScreen ? { x: 0 } : { y: 0 }
              }
              transition={{
                duration: 0.667,
                ease: [0.16, 1, 0.29, 0.99],
              }}
            >
              Viajar nunca fue tán fácil con nexoroute
            </MotionText>
            <MotionText
              variant="h4"
              initial={
                isDesktopScreen ? { x: 40 } : { y: 40 }
              }
              animate={
                isDesktopScreen ? { x: 0 } : { y: 0 }
              }
              sx={{ color: "white" }}
              style={{ y }}
              transition={{
                duration: 0.667,
                ease: [0.16, 1, 0.29, 0.99],
              }}
            >
              Compra tus boletos de autobús de forma rápida,
              segura cómoda.
            </MotionText>
          </Box>

          <Buscador />
        </Box>
      </Box>
      <Box
        sx={{
          maxWidth: "1400px",
          display: "flex",
          flexDirection: "column",
          height: "fit-content",
          margin: "0 auto",
          gap: "8px",
          width: "100%",
          position: "relative",
          padding: "16px",
          "@media (max-width: 1084px)": {
            paddingTop: "calc(175px + 16px)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -100,
            left: 0,
            width: "100%",
          }}
        ></Box>
        <MotionText
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease: "easeInOut", duration: 1 }}
          className="font-brand"
          variant="h5"
          sx={{ margin: "0 auto", textAlign: "center" }}
        >
          ¿Por qué viajar con nosotros?
        </MotionText>
        <Button
          variant="outlined"
          color="accent"
          sx={{
            "@media (max-width: 600px)": {
              width: "100%",
            },
            width: "fit-content",
            margin: "0 auto",
          }}
        >
          Ver todos los destinos
        </Button>
        <MotionText
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease: "easeInOut", duration: 1 }}
          className="font-brand"
          variant="h5"
          sx={{ margin: "0 auto", textAlign: "center" }}
        >
          Destinos populares
        </MotionText>
        <Typography>deojdo</Typography>
        <Typography>deojdo</Typography>
        <Typography>deojdo</Typography>
        <Typography>deojdo</Typography>
        <Typography>deojdo</Typography>
        <MotionText
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease: "easeInOut", duration: 1 }}
          className="font-brand"
          variant="h5"
          sx={{ margin: "0 auto", textAlign: "center" }}
        >
          Viaja como tu prefieras
        </MotionText>
        <Typography>deojdo</Typography>
        <Typography>deojdo</Typography>
        <Typography>deojdo</Typography>
        <Typography>deojdo</Typography>
        <Typography>deojdo</Typography>
        <MotionText
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease: "easeInOut", duration: 1 }}
          className="font-brand"
          variant="h5"
          sx={{ margin: "0 auto", textAlign: "center" }}
        >
          Nuestras amenidades
        </MotionText>
        <Button
          variant="outlined"
          color="accent"
          sx={{
            "@media (max-width: 600px)": {
              width: "100%",
            },
            width: "fit-content",
            margin: "0 auto",
          }}
        >
          Conocer todos los beneficios
        </Button>
      </Box>
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#1A1A1D",
          height: "25dvh",
          color: "white",
          padding: "16px",
        }}
      >
        <Box
          sx={{
            maxWidth: "1400px",
            display: "flex",
            height: "100%",
            margin: "0 auto",
          }}
        >
          Footer
        </Box>
      </Box>
    </Box>
  );
}

function Hero() {
  const container = React.useRef(null);

  const { scrollYProgress } = useScroll({
    target: container,

    offset: ["start start", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ["-10vh", "10vh"],
  );

  return (
    <Box
      sx={{
        width: "100%",
        height: "100dvh",
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
      }}
      id="hero"
    >
      <div
        ref={container}
        className="relative w-full flex items-center justify-center overflow-hidden h-full"
        style={{
          clipPath:
            "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)",
        }}
      >
        <div className="fixed top-[-10vh] left-0 h-[120vh] w-full">
          <motion.div
            style={{ y }}
            className="relative w-full h-full"
          >
            <Image
              src={"/landing.png"}
              fill
              alt="image"
              style={{
                objectFit: "cover",
                objectPosition: "center bottom",
              }}
              priority
            />
          </motion.div>
        </div>
      </div>
    </Box>
  );
}

const Buscador = () => {
  return (
    <MotionPaper
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "start",
        padding: "16px",
        gap: "16px",
        flexDirection: "column",
        "@media (max-width: 1084px)": {
          position: "absolute",
          left: 0,
          bottom: "-175px",
          margin: "0 8px",
          width: "calc(100% - 16px)",
        },
      }}
    >
      <Tabs
        aria-label="tipo de viaje"
        value={0}
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Tab
          label="Ida y vuelta"
          sx={{
            "@media (max-width: 768px)": {
              flex: 1,
            },
          }}
        />
        <Tab
          label="Solo ida"
          sx={{
            "@media (max-width: 768px)": {
              flex: 1,
            },
          }}
        />
      </Tabs>
      <Box
        sx={{
          display: "flex",
          gap: "16px",
          width: "100%",
          "@media (max-width: 1084px)": {
            flexDirection: "column",
          },
        }}
      >
        <TextField
          label="Origen"
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        />
        <TextField
          label="Destino"
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        />
        <TextField
          label="Fecha"
          variant="outlined"
          size="small"
          type="date"
          sx={{ flex: 1 }}
        />
        <TextField
          label="Pasajeros"
          variant="outlined"
          size="small"
          type="number"
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          color="secondary"
          sx={{ flex: 1 }}
        >
          Buscar viajes
        </Button>
      </Box>
    </MotionPaper>
  );
};

const Nav = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isLargeScreen = useMediaQuery("(min-width: 900px)");
  const betweenDesktopAndLargeScreen = useMediaQuery(
    "(min-width: 900px) and (max-width: 1084px)",
  );
  const router = useRouter();
  return (
    <motion.header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        backgroundColor: betweenDesktopAndLargeScreen
          ? alpha(theme.palette.secondary.main, 0.2)
          : "transparent",
        borderRadius: "8px",
        padding: "4px 8px",
      }}
      initial={{ y: -4, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -4, opacity: 0 }}
      transition={{ duration: 1, delay: 0.2 }}
      id="motion-header"
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
          width={75}
          height={50}
        />
        <Box
          sx={{
            display: {
              xs: "flex",
              md: "none",
              lg: "flex",
            },
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

      {!isLargeScreen ? null : (
        <Box
          component={"nav"}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Link
            className="font-brand"
            href={"/login"}
            color="inherit"
            underline="hover"
            sx={{
              "&:hover": {
                color: theme.palette.accent.main,
              },
            }}
          >
            Destinos
          </Link>
          <Link
            className="font-brand"
            href={"/login"}
            color="inherit"
            underline="hover"
            sx={{
              "&:hover": {
                color: theme.palette.accent.main,
              },
            }}
          >
            Viajes
          </Link>
          <Link
            className="font-brand"
            href={"/login"}
            color="inherit"
            underline="hover"
            sx={{
              "&:hover": {
                color: theme.palette.accent.main,
              },
            }}
          >
            Amenidades
          </Link>
          <Link
            className="font-brand"
            href={"/login"}
            color="inherit"
            underline="hover"
            sx={{
              "&:hover": {
                color: theme.palette.accent.main,
              },
            }}
          >
            Ayuda
          </Link>
        </Box>
      )}

      {!isLargeScreen ? (
        <IconButton color="primary">
          <Menu />
        </IconButton>
      ) : (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="text"
            color="inherit"
            onClick={() => router.push("/dashboard")}
          >
            Iniciar sesión
          </Button>
          <Button variant="contained" color="secondary">
            Registrate
          </Button>
        </Box>
      )}
    </motion.header>
  );
};
