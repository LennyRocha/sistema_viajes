"use client";
import {
  CalendarToday,
  LocationOn,
  Map,
  Menu as MenuIcon,
} from "@mui/icons-material";
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
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  CenteredDiv,
  DynamicIcon,
  MotionPaper,
  NumberField,
} from "@nexoroute/commons";
import {
  useScroll,
  useTransform,
  motion,
  animate,
  MotionValue,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import Image from "next/image";
import "@/src/css/landing.css";
import { useRouter } from "next/navigation";
import React from "react";
import dynamic from "next/dynamic";
import { DateField } from "@mui/x-date-pickers/DateField";
import dayjs from "dayjs";

const MotionText = motion.create(Typography);
const MotionButton = motion.create(Button);

const VehiculoCards = dynamic(
  async () => {
    try {
      const { loadRemote } =
        await import("@module-federation/enhanced/runtime");

      const mod = await loadRemote<Record<string, any>>(
        "catalogos/AutobusesModule",
      );
      return {
        default: mod![
          "VehiculoCardsPage"
        ] as React.ComponentType<any>,
      };
    } catch {
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

const ServicioCards = dynamic(
  async () => {
    try {
      const { loadRemote } =
        await import("@module-federation/enhanced/runtime");

      const mod = await loadRemote<Record<string, any>>(
        "catalogos/ServiciosModule",
      );
      return {
        default: mod![
          "ServiciosCardPage"
        ] as React.ComponentType<any>,
      };
    } catch {
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

const RutasCarrusel = dynamic(
  async () => {
    try {
      const { loadRemote } =
        await import("@module-federation/enhanced/runtime");

      const mod = await loadRemote<Record<string, any>>(
        "operaciones/ViajesModule",
      );
      return {
        default: mod![
          "RutasCarrusel"
        ] as React.ComponentType<any>,
      };
    } catch {
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

export default function Page() {
  const theme = useTheme();
  const isDesktopScreen = useMediaQuery(
    "(min-width: 1084px)",
  );
  const ref = React.useRef<HTMLElement>(null);

  const refs = React.useRef({
    title: null as HTMLDivElement | null,
    destinies: null as HTMLDivElement | null,
    buses: null as HTMLDivElement | null,
    services: null as HTMLDivElement | null,
  });

  const scrollToRef = (name: keyof typeof refs.current) => {
    const element = refs.current[name];
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
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
              paddingBottom: "250px",
            },
          }}
        >
          <Nav scrollToRef={scrollToRef} />

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
              "@media (max-width: 1084px)": {
                gap: "4px",
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
        <BeneficiosSection
          titleRef={(el: any) => (refs.current.title = el)}
        />
        <Divider />
        <DestinosSection
          titleRef={(el: any) =>
            (refs.current.destinies = el)
          }
        />
        <Divider />
        <BusesSection
          titleRef={(el: any) => (refs.current.buses = el)}
        />
        <Divider />
        <ServicesSection
          titleRef={(el: any) =>
            (refs.current.services = el)
          }
        />
      </Box>
      <Footer scrollToRef={scrollToRef} />
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

function a11yProps(typex: string) {
  return {
    id: `viaje-tab-${typex}`,
    "aria-controls": `viaje-tabpanel-${typex}`,
  };
}

const Buscador = () => {
  const day = new Date().getDay() || 0;
  const month = new Date().getMonth() || 0;
  const year = new Date().getFullYear() || 0;
  const [searchParams, setSearchParams] = React.useState({
    from: "",
    to: "",
    fechaIda: new Date(year, month, day),
    fechaVuelta: new Date(year, month, day + 2),
    pasajeros: 1,
  });
  const addParam = (
    key: keyof typeof searchParams,
    value: string,
  ) => {
    setSearchParams((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  };
  const removeParam = (key: keyof typeof searchParams) => {
    setSearchParams((prev: any) => {
      const newParams = { ...prev };
      delete newParams[key];
      return newParams;
    });
  };
  const getParam = (key: keyof typeof searchParams) => {
    return searchParams[key];
  };
  const [tab, setTab] = React.useState(0);
  const handleChange = (
    event: React.SyntheticEvent,
    newValue: number,
  ) => {
    if (newValue === 1) {
      removeParam("fechaVuelta");
    } else {
      addParam(
        "fechaVuelta",
        new Date(year, month, day + 2).toISOString(),
      );
    }
    setTab(newValue);
  };
  const shapeParams = () => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        params.set(key, value.toString().toLowerCase());
      }
    });
    return params;
  };

  const { push } = useRouter();
  return (
    <MotionPaper
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ ease: "easeInOut", duration: 1 }}
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
        value={tab}
        onChange={handleChange}
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Tab
          {...a11yProps("ida-y-vuelta")}
          label="Ida y vuelta"
          sx={{
            "@media (max-width: 768px)": {
              flex: 1,
            },
          }}
        />
        <Tab
          {...a11yProps("solo-ida")}
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
          value={getParam("from") ?? ""}
          onChange={(e) => {
            const value = e.target.value.replace(
              /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
              "",
            );
            addParam("from", value);
          }}
          slotProps={{
            input: {
              endAdornment: <LocationOn />,
            },
            htmlInput: {
              maxLength: 100,
            },
          }}
        />
        <TextField
          label="Destino"
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
          value={getParam("to") ?? ""}
          onChange={(e) => {
            const value = e.target.value.replace(
              /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
              "",
            );
            addParam("to", value);
          }}
          slotProps={{
            input: {
              endAdornment: <Map />,
            },
            htmlInput: {
              maxLength: 100,
            },
          }}
        />
        <DateField
          label="Fecha de ida"
          variant="outlined"
          format="DD/MM/YYYY"
          defaultValue={dayjs(
            getParam("fechaIda") ??
              new Date(year, month, day),
          )}
          size="small"
          sx={{ flex: 1 }}
          endAdornment={<CalendarToday />}
        />
        {tab === 0 && (
          <DateField
            label="Fecha de vuelta"
            variant="outlined"
            format="DD/MM/YYYY"
            defaultValue={dayjs(
              getParam("fechaVuelta") ??
                new Date(year, month, day + 2),
            )}
            size="small"
            sx={{ flex: 1 }}
            endAdornment={<CalendarToday />}
          />
        )}
        <NumberField
          id={"pasajeros-field"}
          label="Pasajeros"
          min={0}
          max={8}
          defaultValue={Number(getParam("pasajeros") ?? 0)}
          size="small"
          error={false}
          onValueChange={(value) => {
            if (value == null) {
              addParam("pasajeros", "");
              return;
            }

            if (value >= 1 && value <= 8) {
              addParam("pasajeros", String(value));
            }
          }}
        />
        <Button
          variant="contained"
          color="secondary"
          sx={{ flex: 1 }}
          onClick={() =>
            push(
              `viajes/${shapeParams()?.toString ? `?${shapeParams()?.toString()}` : ""}`,
            )
          }
        >
          Buscar viajes
        </Button>
      </Box>
    </MotionPaper>
  );
};

const Nav = ({ scrollToRef }: { scrollToRef: any }) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery("(min-width: 900px)");
  const router = useRouter();

  const id = React.useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const [anchorEl, setAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <motion.header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        backgroundColor: alpha(
          theme.palette.text.secondary,
          0.25,
        ),
        borderRadius: "8px",
        padding: "4px 8px",
        backdropFilter: "blur(10px)",
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
          src={"/assets/logo_white_sf.png"}
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
            sx={{ margin: 0, color: "white" }}
          >
            Nexoroute
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "white" }}
          >
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
            href={"#"}
            onClick={(e) => {
              e.preventDefault();
              scrollToRef("title");
            }}
            underline="hover"
            sx={{
              color: "white",
              "&:hover": {
                color: theme.palette.accent.main,
              },
            }}
          >
            Conocenos
          </Link>
          <Link
            className="font-brand"
            href={"#"}
            onClick={(e) => {
              e.preventDefault();
              scrollToRef("destinies");
            }}
            underline="hover"
            sx={{
              color: "white",
              "&:hover": {
                color: theme.palette.accent.main,
              },
            }}
          >
            Destinos
          </Link>
          <Link
            className="font-brand"
            href={"#"}
            onClick={(e) => {
              e.preventDefault();
              scrollToRef("buses");
            }}
            underline="hover"
            sx={{
              color: "white",
              "&:hover": {
                color: theme.palette.accent.main,
              },
            }}
          >
            Viajes
          </Link>
          <Link
            className="font-brand"
            href={"#"}
            onClick={(e) => {
              e.preventDefault();
              scrollToRef("services");
            }}
            underline="hover"
            sx={{
              color: "white",
              "&:hover": {
                color: theme.palette.accent.main,
              },
            }}
          >
            Amenidades
          </Link>
        </Box>
      )}

      {!isLargeScreen ? (
        <>
          <IconButton
            aria-label="options"
            size="small"
            color="primary"
            id={buttonId}
            aria-controls={open ? menuId : undefined}
            aria-haspopup="true"
            aria-expanded={open}
            onClick={handleClick}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id={menuId}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{
              list: {
                "aria-labelledby": buttonId,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleClose();
                scrollToRef("title");
              }}
            >
              Conocenos
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                scrollToRef("destinies");
              }}
            >
              Destinos
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                scrollToRef("buses");
              }}
            >
              Viajes
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                scrollToRef("services");
              }}
            >
              Amenidades
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                router.push("/login");
              }}
            >
              Iniciar sesión
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                router.push("/signup");
              }}
            >
              Registrate
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="text"
            color="primary"
            onClick={() => router.push("/login")}
          >
            Iniciar sesión
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => router.push("/signup")}
          >
            Registrate
          </Button>
        </Box>
      )}
    </motion.header>
  );
};

const Footer = ({ scrollToRef }: { scrollToRef: any }) => {
  const theme = useTheme();
  const md = useMediaQuery("(min-width: 900px)");
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#1A1A1D",
        height: "25dvh",
        color: "white",
        padding: "32px 16px",
      }}
    >
      <Box
        sx={{
          maxWidth: "1400px",
          display: "flex",
          height: "100%",
          margin: "0 auto",
          flexDirection: { xs: "column", md: "row" },
          gap: "16px",
          justifyContent: {
            xs: "center",
            md: "space-between",
          },
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 4 },
          }}
        >
          {/*Logo */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 25,
                position: "relative",
              }}
            >
              <Image
                src={"/assets/logo_white_sf.png"}
                alt="logo"
                style={{
                  objectFit: "contain",
                }}
                fill
                sizes="(max-width: 600px) 100vw, 50vw"
              />
            </Box>
            <Typography
              variant="subtitle2"
              className="font-brand"
              sx={{
                margin: 0,
                color: "white",
              }}
              style={{
                fontSize: "1rem",
              }}
            >
              Nexoroute
            </Typography>
          </Box>
          {/*Links */}
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
              href={"#"}
              onClick={(e) => {
                e.preventDefault();
                scrollToRef("title");
              }}
              color="textSecondary"
              underline="hover"
              sx={{
                "&:hover": {
                  color: theme.palette.accent.main,
                },
              }}
            >
              Conocenos
            </Link>
            <Link
              href={"#"}
              onClick={(e) => {
                e.preventDefault();
                scrollToRef("destinies");
              }}
              color="textSecondary"
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
              href={"#"}
              onClick={(e) => {
                e.preventDefault();
                scrollToRef("buses");
              }}
              color="textSecondary"
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
              href={"#"}
              onClick={(e) => {
                e.preventDefault();
                scrollToRef("services");
              }}
              color="textSecondary"
              underline="hover"
              sx={{
                "&:hover": {
                  color: theme.palette.accent.main,
                },
              }}
            >
              Amenidades
            </Link>
          </Box>
        </Box>
        {md && <Divider />}
        <small>©2026 Made with ❤️ by STEAM</small>
      </Box>
    </Box>
  );
};

const BeneficiosSection = ({
  titleRef,
}: {
  titleRef: any;
}) => {
  return (
    <>
      <MotionText
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: "easeInOut", duration: 1 }}
        className="font-brand"
        variant="h5"
        sx={{ margin: "0 auto", textAlign: "center" }}
        ref={titleRef}
      >
        ¿Por qué viajar con nosotros?
      </MotionText>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              ease: "easeInOut",
              duration: 1,
            }}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Box
              sx={(theme) => ({
                backgroundColor: alpha(
                  theme.palette.divider,
                  0.08,
                ),
                padding: "24px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <DynamicIcon
                name={"shield_lock"}
                size="xxl"
              />
            </Box>
            <Typography variant="subtitle1">
              Seguro y confiable
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ textAlign: "center" }}
            >
              Tus datos y pagos están protegidos con
              nosotros, garantizando una experiencia de
              viaje segura y confiable.
            </Typography>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              ease: "easeInOut",
              duration: 1,
              delay: 0.4,
            }}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Box
              sx={(theme) => ({
                backgroundColor: alpha(
                  theme.palette.divider,
                  0.08,
                ),
                padding: "24px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <DynamicIcon name={"event_seat"} size="xxl" />
            </Box>
            <Typography variant="subtitle1">
              Comodidad
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ textAlign: "center" }}
            >
              Autobuses modernos con asientos cómodos y
              espaciosos para un viaje placentero.
            </Typography>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              ease: "easeInOut",
              duration: 1,
              delay: 0.8,
            }}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Box
              sx={(theme) => ({
                backgroundColor: alpha(
                  theme.palette.divider,
                  0.08,
                ),
                padding: "24px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <DynamicIcon
                name={"nest_clock_farsight_analog"}
                size="xxl"
              />
            </Box>
            <Typography variant="subtitle1">
              Puntualidad
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ textAlign: "center" }}
            >
              Llegamos a tiempo a tu destino para que
              disfrutes de tu viaje sin preocupaciones.
            </Typography>
          </motion.div>
        </Grid>
      </Grid>
    </>
  );
};

const DestinosSection = ({
  titleRef,
}: {
  titleRef: any;
}) => {
  const [disabled, setDisabled] = React.useState(true);
  const ref = React.useRef(null);
  const { scrollXProgress } = useScroll({ container: ref });
  const maskImage = useScrollOverflowMask(scrollXProgress);
  const router = useRouter();
  return (
    <>
      <MotionText
        ref={titleRef}
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
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: "easeInOut", duration: 1 }}
        style={{
          margin: "0 auto",
          width: "100%",
          overflowX: "scroll",
          overflowY: "hidden",
          height: 250,
          maskImage,
        }}
      >
        <RutasCarrusel
          disabledFunction={setDisabled}
          router={router}
        />
      </motion.div>
      {/*<motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: "easeInOut", duration: 1 }}
        style={{
          margin: "0 auto",
          width: "100%",
          overflowX: "scroll",
          overflowY: "hidden",
          height: 250,
          maskImage,
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            gap: "8px",
            height: "100%",
          }}
        >
          {itemData.map((item) => (
            <ImageListItem
              key={item.img}
              sx={{ width: "max(25vw, 300px)" }}
            >
              <img
                srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
                src={`${item.img}?w=248&fit=crop&auto=format`}
                alt={item.title}
                loading="lazy"
              />
              <ImageListItemBar
                title={item.title}
                subtitle={item.author}
                actionIcon={
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.5,
                      alignItems: "center",
                      width: "fit-content",
                    }}
                  >
                    <Tooltip title="Simular viaje">
                      <IconButton
                        color="default"
                        aria-label={`info about ${item.title}`}
                        onClick={() =>
                          router.push(
                            "/simular_viaje/terminal-san-casteabro-a-terminal-tempinotitlan",
                          )
                        }
                      >
                        <Map />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver viajes">
                      <IconButton
                        color="default"
                        aria-label={`info about ${item.title}`}
                        onClick={() =>
                          router.push(
                            "/viajes/terminal-san-casteabro-a-terminal-tempinotitlan",
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
      </motion.div>*/}
      <MotionButton
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: "easeInOut", duration: 1 }}
        variant="outlined"
        color="accent"
        sx={{
          "@media (max-width: 600px)": {
            width: "100%",
          },
          width: "fit-content",
          margin: "0 auto",
        }}
        onClick={() => router.push("/viajes")}
        disabled={disabled}
      >
        Ver todos los destinos
      </MotionButton>
    </>
  );
};

const BusesSection = ({ titleRef }: { titleRef: any }) => {
  return (
    <>
      <MotionText
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: "easeInOut", duration: 1 }}
        className="font-brand"
        variant="h5"
        sx={{ margin: "0 auto", textAlign: "center" }}
        ref={titleRef}
      >
        Viaja como tu prefieras
      </MotionText>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: "easeInOut", duration: 1 }}
        style={{
          margin: "0 auto",
          width: "100%",
        }}
      >
        <VehiculoCards
          onClick={(tipo: string, bus: any) =>
            console.log(tipo, bus)
          }
        />
      </motion.div>
    </>
  );
};

const ServicesSection = ({
  titleRef,
}: {
  titleRef: any;
}) => {
  const [disabled, setDisabled] = React.useState(true);
  const { push } = useRouter();
  return (
    <>
      <MotionText
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: "easeInOut", duration: 1 }}
        className="font-brand"
        variant="h5"
        sx={{ margin: "0 auto", textAlign: "center" }}
        ref={titleRef}
      >
        Nuestras amenidades
      </MotionText>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: "easeInOut", duration: 1 }}
        style={{
          margin: "0 auto",
          width: "100%",
        }}
      >
        <ServicioCards disabledFunction={setDisabled} />
      </motion.div>
      <MotionButton
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: "easeInOut", duration: 1 }}
        variant="outlined"
        color="accent"
        sx={{
          "@media (max-width: 600px)": {
            width: "100%",
          },
          width: "fit-content",
          margin: "0 auto",
        }}
        disabled={disabled}
        onClick={() => push("/servicios")}
      >
        Conocer los beneficios
      </MotionButton>
    </>
  );
};

function useScrollOverflowMask(
  scrollXProgress: MotionValue<number>,
) {
  const left = `0%`;
  const right = `100%`;
  const leftInset = `20%`;
  const rightInset = `80%`;
  const transparent = `#0000`;
  const opaque = `#000`;
  const maskImage = useMotionValue(
    `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`,
  );

  useMotionValueEvent(
    scrollXProgress,
    "change",
    (value) => {
      if (value === 0) {
        animate(
          maskImage,
          `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`,
        );
      } else if (value === 1) {
        animate(
          maskImage,
          `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${right}, ${opaque})`,
        );
      } else if (
        scrollXProgress.getPrevious() === 0 ||
        scrollXProgress.getPrevious() === 1
      ) {
        animate(
          maskImage,
          `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${rightInset}, ${transparent})`,
        );
      }
    },
  );

  return maskImage;
}
