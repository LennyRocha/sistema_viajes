"use client";

import React, { forwardRef } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  MobileStepper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  usePresenceData,
  Variants,
} from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import CompraSummary from "../core/components/CompraSummary";
import dynamic from "next/dynamic";
import { MotionPaper } from "@nexoroute/commons";
import useSetCompra from "../core/hooks/useSetCompra";
import { Compra, Comprador } from "../core/types/Compra";

const steps = [
  "Asientos",
  "Pasajeros",
  "Datos de comprador",
  "Confirmación",
  "Pago",
];

const BusMap = dynamic(
  async () => {
    const { loadRemote } =
      await import("@module-federation/enhanced/runtime");

    const mod = await loadRemote<Record<string, any>>(
      "catalogos/AutobusesModule",
    );
    return {
      default: mod![
        "SeatSelector"
      ] as React.ComponentType<any>,
    };
  },
  {
    ssr: false,
    loading: () => <CircularProgress />,
  },
);

const PasajeroCard = dynamic(
  async () => {
    const { loadRemote } =
      await import("@module-federation/enhanced/runtime");

    const mod = await loadRemote<Record<string, any>>(
      "catalogos/AutobusesModule",
    );
    return {
      default: mod!["SeatCard"] as React.ComponentType<any>,
    };
  },
  {
    ssr: false,
    loading: () => <CircularProgress />,
  },
);

const PasajeroBilling = dynamic(
  async () => {
    const { loadRemote } =
      await import("@module-federation/enhanced/runtime");

    const mod = await loadRemote<Record<string, any>>(
      "catalogos/AutobusesModule",
    );
    return {
      default: mod!["SeatBilling"] as React.ComponentType<any>,
    };
  },
  {
    ssr: false,
    loading: () => <CircularProgress />,
  },
);

const variants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 80 : -80,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      visualDuration: 0.35,
      bounce: 0.25,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -80 : 80,
    transition: {
      duration: 0.2,
    },
  }),
};

export default function CompraForm() {
  const isLargeScreen = useMediaQuery("(min-width: 600px)");
  const [activeStep, setActiveStep] = React.useState(0);
  const [direction, setDirection] = React.useState<1 | -1>(
    1,
  );

  const handleNext = () => {
    if (activeStep >= steps.length - 1) return;

    setDirection(1);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep <= 0) return;

    setDirection(-1);
    setActiveStep((prev) => prev - 1);
  };

  const {
    formData,
    setField,
    setCompradorField,
    setPasajero,
  } = useSetCompra();

  const components = {
    0: (
      <Box
        sx={{
          width: "100%",
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          "@media(min-width: 945px)": {
            flexDirection: "row",
          },
          gap: 2,
          padding: "2px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            minHeight: 0,
            flex: 1,
            gap: 4,
          }}
        >
          <Typography
            variant="h3"
            className="font-brand"
            sx={{
              mx: "auto",
              "@media(min-width: 900px)": {
                mx: 0,
              },
            }}
          >
            Asientos de vuelta
          </Typography>
          <PasajeroBilling />
          <BusMap
            tipo={2}
            onSelect={(seat: any) =>
              console.log("Asiento 2", seat)
            }
          />
        </Box>
        <CompraSummary tipo="ida" />
      </Box>
    ),
    1: <Step2 />,
    2: (
      <Step3 data={formData} setField={setCompradorField} />
    ),
    3: (
      <div
        style={{
          backgroundColor: "red",
          width: "100%",
          height: "100%",
        }}
      >
        Confirmación
      </div>
    ),
    4: (
      <div
        style={{
          backgroundColor: "blue",
          width: "100%",
          height: "100%",
        }}
      >
        Pago
      </div>
    ),
  };

  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          width: "100%",
          maxWidth: "1170px",
          margin: "auto",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 2,
          position: "relative",
        }}
      >
        {isLargeScreen && (
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        <Box
          sx={{
            flex: 1,
            position: "relative",
            overflow: "auto",
          }}
        >
          <AnimatePresence
            mode="wait"
            initial={false}
            custom={direction}
          >
            <AnimatedStep key={activeStep}>
              {
                components[
                  activeStep as keyof typeof components
                ]
              }
            </AnimatedStep>
          </AnimatePresence>
        </Box>

        {isLargeScreen && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Anterior
            </Button>

            <Button
              variant="contained"
              onClick={handleNext}
              disabled={activeStep === steps.length - 1}
            >
              Siguiente
            </Button>
          </Box>
        )}

        {!isLargeScreen && (
          <MobileStepper
            variant="text"
            steps={steps.length}
            position="static"
            activeStep={activeStep}
            sx={{ width: "100%" }}
            slotProps={{
              progress: {
                "aria-label": "stepper linear progress",
              },
            }}
            nextButton={
              <IconButton
                size="small"
                onClick={handleNext}
                disabled={activeStep === steps.length - 1}
              >
                <ChevronRight />
              </IconButton>
            }
            backButton={
              <IconButton
                size="small"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                <ChevronLeft />
              </IconButton>
            }
          />
        )}
      </Box>
    </>
  );
}

const AnimatedStep = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
  }
>(function AnimatedStep({ children }, ref) {
  const direction = (usePresenceData() as number) ?? 1;

  return (
    <motion.div
      ref={ref}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
      layout
    >
      {children}
    </motion.div>
  );
});

const Header = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <MotionPaper sx={{ p: 2, width: "100%" }}>
      <Box
        sx={{
          maxWidth: "1400px",
          width: "100%",
          mx: "auto",
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
      </Box>
    </MotionPaper>
  );
};

const Step2 = ({}) => {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        "@media(min-width: 1000px)": {
          flexDirection: "row",
        },
        gap: 2,
        padding: "2px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
          flex: 1,
          gap: 4,
        }}
      >
        <Typography variant="h3" className="font-brand">
          Registro de pasajeros
        </Typography>
        <PasajeroCard />
        <PasajeroCard />
      </Box>
      <CompraSummary tipo="vuelta" />
    </Box>
  );
};

const Step3 = ({
  data,
  setField,
}: {
  data: Compra;
  setField: (field: keyof Comprador, value: any) => void;
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        "@media(min-width: 1000px)": {
          flexDirection: "row",
        },
        gap: 2,
        padding: "2px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
          flex: 1,
          gap: 4,
        }}
      >
        <Typography variant="h3" className="font-brand">
          Datos del comprador
        </Typography>
        <TextField
          label="Nombre (s)"
          fullWidth
          required
          placeholder="Ej. José Armando"
          value={data.comprador?.nombres}
          onChange={(e) =>
            setField("nombres", e.target.value.trim())
          }
        />
        <TextField
          label="Apellido paterno"
          fullWidth
          required
          placeholder="Ej. Trujillo"
          value={data.comprador?.apellido_paterno}
          onChange={(e) =>
            setField(
              "apellido_paterno",
              e.target.value.trim(),
            )
          }
        />
        <TextField
          label="Apellido materno (opcional)"
          fullWidth
          placeholder="Ej. Guzmán"
          value={data.comprador?.apellido_materno}
          onChange={(e) =>
            setField(
              "apellido_materno",
              e.target.value.trim(),
            )
          }
        />
        <TextField
          label="Correo electrónico"
          fullWidth
          required
          placeholder="Ej. josetrujillo@gmail.com"
          type="email"
          inputMode="email"
          value={data.comprador?.email}
          onChange={(e) =>
            setField("email", e.target.value.trim())
          }
        />
        <TextField
          label="Teléfono"
          fullWidth
          required
          placeholder="Ej. 777 123 45 67"
          inputMode="tel"
          value={data.comprador?.telefono}
          onChange={(e) =>
            setField("telefono", e.target.value.trim())
          }
        />
        {data.comprador?.email && (
          <Alert severity="success">
            Los boletos serán enviados a{" "}
            {data.comprador.email}
          </Alert>
        )}
      </Box>
      <CompraSummary tipo="vuelta" />
    </Box>
  );
};
