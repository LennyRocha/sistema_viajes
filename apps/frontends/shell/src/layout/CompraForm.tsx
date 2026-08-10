"use client";

import React, { forwardRef } from "react";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  MobileStepper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
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
  AccountBalanceOutlined,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  PaymentsOutlined,
  Schedule,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import CompraSummary, {
  CompraSummaryProps,
} from "../core/components/CompraSummary";
import dynamic from "next/dynamic";
import {
  CenteredDiv,
  MotionPaper,
  snack,
} from "@nexoroute/commons";
import useSetCompra from "../core/hooks/useSetCompra";
import { Compra, Comprador } from "../core/types/Compra";
import {
  formatCardNumber,
  formatCVV,
  formatExpiryDate,
  formatPhoneNumber,
  formatZipCode,
  isExpiryDateValid,
} from "../adapters/formatPayment";

import Visa from "../assets/visa.svg";
import MasterCard from "../assets/mastercard.svg";
import AmericanExpress from "../assets/american-express.svg";
import OXXO from "../assets/oxxo.svg";
import BVVA from "../assets/bbva.svg";

import { useSalida } from "../providers/ViajeProvider";
import { useRouter } from "next/navigation";
import Asiento from "../core/types/Asiento";
import { estadosDeMexico } from "../utils/estadosDeMexico";
import theme from "@/theme";

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
    loading: () => (
      <CenteredDiv>
        <CircularProgress />
      </CenteredDiv>
    ),
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
    loading: () => (
      <CenteredDiv>
        <CircularProgress />
      </CenteredDiv>
    ),
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
      default: mod![
        "SeatBilling"
      ] as React.ComponentType<any>,
    };
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

  const router = useRouter();

  const {
    getSalidaId,
    fetchSalida,
    cleanSalida,
    pasajeros,
  } = useSalida();
  const [loading, setLoading] = React.useState(false);
  const [salidaData, setSalidaData] =
    React.useState<any>(null);
  const [plantillaBus, setPlantillaBus] = React.useState<{
    idTipoBus: number;
    asientos: Asiento[];
  } | null>(null);

  const fetchOrRedirect = async () => {
    const id = getSalidaId();
    setLoading(true);

    if (id !== null) {
      try {
        const data: any = await fetchSalida(id);
        setSalidaData(data);
        if (data.autobus) {
          setPlantillaBus({
            idTipoBus: data.autobus.tipoAutobus.id,
            asientos: data.autobus.asientos || [],
          });
        }
      } catch {
        router.replace("/");
      } finally {
        setLoading(false);
      }
    } else {
      router.replace("/");
    }
  };

  React.useEffect(() => {
    fetchOrRedirect();
    //return () => cleanSalida();
  }, []);

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
            tipo={plantillaBus?.idTipoBus ?? 1}
            {...(plantillaBus?.asientos && {
              seats: plantillaBus.asientos,
            })}
            onSelect={(seat: any) =>
              console.log("Asiento 2", seat)
            }
          />
        </Box>
        <CompraSummary tipo="ida" />
      </Box>
    ),
    1: <Step2 pasajeros={pasajeros} />,
    2: (
      <Step3
        data={formData}
        setField={setCompradorField}
        summaryProps={{
          buttonText: "Siguiente",
          onClickButton() {
            handleNext();
          },
          tipo: "ida",
        }}
      />
    ),
    3: (
      <Step4
        summaryProps={{
          buttonText: "Continuar",
          onClickButton() {
            handleNext();
          },
          tipo: "vuelta",
        }}
      />
    ),
    4: (
      <Step5
        summaryProps={{
          buttonText: "Confirmar compra",
          onClickButton() {
            console.log("Confirmar compra", formData);
          },
          tipo: "ida",
        }}
        metodoPagoId={formData.metodoPagoId}
        setField={setField}
      />
    ),
  };

  return (
    <>
      <Header isFetching={loading} />
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

        {loading ? (
          <Backdrop
            sx={(theme) => ({
              color: "#fff",
              zIndex: theme.zIndex.drawer + 1,
            })}
            open
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        ) : (
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
        )}

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

const Header = ({
  isFetching,
}: {
  isFetching: boolean;
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
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
        {!isFetching && <TimerText />}
      </Box>
    </MotionPaper>
  );
};

const Step2 = ({ pasajeros }: { pasajeros: number }) => {
  const pasajerosArray = Array.from(
    { length: pasajeros },
    (_, i) => ({
      nombres: "",
      apellidos: "",
      asientos: [],
    }),
  );
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
        {pasajerosArray.map((_, index) => (
          <PasajeroCard
            key={index + 1}
            numero={index + 1}
            asientoIda={`A${index + 1}`}
            asientoVuelta={`A${index + 1}`}
            nombre={_.nombres}
            apellido={_.apellidos}
            setNombre={() => {}}
            setApellido={() => {}}
          />
        ))}
      </Box>
      <CompraSummary tipo="vuelta" />
    </Box>
  );
};

const Step3 = ({
  data,
  setField,
  summaryProps,
}: {
  data: Compra;
  setField: (field: keyof Comprador, value: any) => void;
  summaryProps: CompraSummaryProps;
}) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const isEmailValid = emailRegex.test(
    data.comprador?.email || "",
  );
  const isValid = React.useMemo(() => {
    return (
      data.comprador?.nombres &&
      data.comprador?.apellido_paterno &&
      data.comprador?.email &&
      data.comprador?.telefono &&
      isEmailValid
    );
  }, [
    data.comprador?.nombres,
    data.comprador?.apellido_paterno,
    data.comprador?.email,
    data.comprador?.telefono,
    isEmailValid,
  ]);
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
          size="small"
          fullWidth
          required
          placeholder="Ej. José Armando"
          value={data.comprador?.nombres}
          onChange={(e) => {
            const value = e.target.value.replace(
              /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
              "",
            );

            setField("nombres", value.trim());
          }}
          slotProps={{
            htmlInput: {
              maxLength: 50,
            },
          }}
          autoCapitalize="words"
          autoFocus
        />
        <TextField
          label="Apellido paterno"
          size="small"
          fullWidth
          required
          placeholder="Ej. Trujillo"
          value={data.comprador?.apellido_paterno}
          onChange={(e) => {
            const value = e.target.value.replace(
              /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
              "",
            );
            setField("apellido_paterno", value.trim());
          }}
          slotProps={{
            htmlInput: {
              maxLength: 50,
            },
          }}
          autoCapitalize="words"
        />
        <TextField
          label="Apellido materno (opcional)"
          size="small"
          fullWidth
          placeholder="Ej. Guzmán"
          value={data.comprador?.apellido_materno}
          onChange={(e) => {
            const value = e.target.value.replace(
              /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
              "",
            );
            setField("apellido_materno", value.trim());
          }}
          slotProps={{
            htmlInput: {
              maxLength: 50,
            },
          }}
          autoCapitalize="words"
        />
        <TextField
          label="Correo electrónico"
          size="small"
          fullWidth
          required
          placeholder="Ej. josetrujillo@gmail.com"
          type="email"
          inputMode="email"
          value={data.comprador?.email}
          onChange={(e) =>
            setField("email", e.target.value.trim())
          }
          slotProps={{
            htmlInput: {
              maxLength: 100,
            },
          }}
        />
        <TextField
          label="Teléfono"
          size="small"
          fullWidth
          required
          placeholder="Ej. 777 123 45 67"
          inputMode="tel"
          value={formatPhoneNumber(
            data.comprador?.telefono || "",
          )}
          onChange={(e) =>
            setField("telefono", e.target.value.trim())
          }
          slotProps={{
            htmlInput: {
              maxLength: 13,
            },
          }}
        />
        {data.comprador?.email && isEmailValid && (
          <Alert severity="success">
            Los boletos serán enviados a{" "}
            {data.comprador.email}
          </Alert>
        )}
        <Typography variant="caption" color="error">
          <b style={{ color: "red" }}>*</b> Campos
          obligatorios
        </Typography>
      </Box>
      <CompraSummary
        {...summaryProps}
        buttonDisbaled={!isValid}
      />
    </Box>
  );
};

const Step4 = ({
  summaryProps,
}: {
  summaryProps: CompraSummaryProps;
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
          Confirmar información
        </Typography>
      </Box>
      <CompraSummary {...summaryProps} />
    </Box>
  );
};

const Step5 = ({
  summaryProps,
  metodoPagoId,
  setField,
}: {
  summaryProps: CompraSummaryProps;
  metodoPagoId: number;
  setField: (field: keyof Compra, value: any) => void;
}) => {
  const theme = useTheme();

  const [cardnum, setCardnum] = React.useState<string>("");
  const [expiry, setExpiry] = React.useState<string>("");
  const [cvv, setCvv] = React.useState<string>("");
  const [zipCode, setZipCode] = React.useState<string>("");
  const [cardHolder, setCardHolder] =
    React.useState<string>("");
  const [city, setCity] = React.useState<string>("");
  const [state, setState] = React.useState<string>("");

  const sm = useMediaQuery("(max-width: 600px)");
  const [inpType, setInpType] = React.useState<
    "password" | "text"
  >("password");

  const handleTipoPago = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null,
  ) => {
    setField(
      "metodoPagoId",
      newAlignment ? Number.parseInt(newAlignment) : null,
    );
  };

  const [expiryError, setExpiryError] =
    React.useState(false);

  const toggleButtonSx = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  };

  React.useEffect(() => {
    if (metodoPagoId !== 1) {
      setCardHolder("");
      setCardnum("");
      setZipCode("");
      setExpiry("");
      setState("");
      setCity("");
      setCvv("");
      setField("metodoPago", null);
    } else {
      setField("metodoPago", {
        cardnum,
        expiry,
        cvv,
        cardHolder,
        zipCode,
        state,
        city,
      });
    }
  }, [metodoPagoId, cardnum, expiry, cvv]);

  const isValid = React.useMemo(() => {
    if (metodoPagoId === 1) {
      return (
        cardnum.replace(/\s/g, "").length >= 13 &&
        expiry.length === 5 &&
        (cvv.length === 3 || cvv.length === 4) &&
        cardHolder.length > 0 &&
        zipCode.length >= 5 &&
        state.length > 0 &&
        city.length > 0 &&
        !expiryError
      );
    }
    return true;
  }, [
    metodoPagoId,
    cardnum,
    expiry,
    cvv,
    cardHolder,
    zipCode,
    state,
    city,
    expiryError,
  ]);

  const forms = {
    1: (
      <Box
        sx={{
          width: "100%",
          minHeight: "100%",
          display: "flex",
          gap: 2,
          flexDirection: "column",
        }}
      >
        <Typography variant="subtitle2">
          Pago con tarjeta de crédito o débito
        </Typography>
        <TextField
          size="small"
          fullWidth
          label="Títular de la tarjeta"
          autoFocus
          placeholder="Ingresa el nombre completo"
          autoCapitalize="words"
          required
          value={cardHolder}
          onChange={(e) => {
            const value = e.target.value.replace(
              /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
              "",
            );
            setCardHolder(value.trim());
          }}
        />
        <TextField
          size="small"
          fullWidth
          label="Número de la tarjeta"
          placeholder="XXXX XXXX XXXX XXXX"
          type="text"
          inputMode="numeric"
          slotProps={{
            htmlInput: {
              maxLength: 19,
              pattern: String.raw`[0-9\s]{13,19}`,
            },
            input: {
              endAdornment: (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "fit-content",
                    mr: { xs: 2, sm: 0 },
                  }}
                >
                  <Image
                    priority
                    src={Visa}
                    alt="visa"
                    width={20}
                  />
                  <Image
                    priority
                    src={MasterCard}
                    alt="mastercard"
                    width={20}
                  />
                  <Image
                    priority
                    src={AmericanExpress}
                    alt="american express"
                    width={20}
                  />
                </Box>
              ),
            },
          }}
          required
          value={cardnum}
          onChange={(e) =>
            setCardnum(formatCardNumber(e.target.value))
          }
        />
        <Box
          sx={{
            display: "flex",
            width: "100%",
            gap: 2,
            "@media(max-width: 600px)": {
              flexDirection: "column",
            },
          }}
        >
          <TextField
            size="small"
            fullWidth
            label="Fecha de vencimiento"
            placeholder="MM/AA"
            type="text"
            inputMode="numeric"
            slotProps={{
              htmlInput: {
                maxLength: 5,
                pattern: "[0-9]{2}/[0-9]{2}",
              },
            }}
            required
            error={expiryError}
            helperText={expiryError ? "Fecha inválida" : ""}
            value={expiry}
            onChange={(e) => {
              setExpiry(formatExpiryDate(e.target.value));
              setExpiryError(false); // limpia el error mientras edita
            }}
            onBlur={() => {
              if (expiry.length === 5) {
                setExpiryError(!isExpiryDateValid(expiry));
              }
            }}
          />
          <TextField
            size="small"
            fullWidth
            label="CVV"
            placeholder="XXX"
            type="text"
            inputMode="numeric"
            slotProps={{
              htmlInput: {
                maxLength: 4,
                pattern: "[0-9]{3,4}",
                autoComplete: "off",
                style: {
                  WebkitTextSecurity:
                    inpType === "password"
                      ? "disc"
                      : "none",
                } as React.CSSProperties,
              },
              input: {
                endAdornment: (
                  <Tooltip
                    title={
                      inpType === "password"
                        ? "Mostrar"
                        : "Ocultar"
                    }
                  >
                    <IconButton
                      onClick={() =>
                        setInpType(
                          inpType === "password"
                            ? "text"
                            : "password",
                        )
                      }
                    >
                      {inpType === "password" ? (
                        <Visibility />
                      ) : (
                        <VisibilityOff />
                      )}
                    </IconButton>
                  </Tooltip>
                ),
              },
            }}
            required
            value={cvv}
            onChange={(e) => {
              setCvv(formatCVV(e.target.value));
            }}
          />
          <TextField
            size="small"
            fullWidth
            label="Código postal"
            placeholder="XXXXX"
            type="text"
            inputMode="numeric"
            slotProps={{
              htmlInput: {
                maxLength: 6,
                pattern: "[0-9]{6}",
              },
            }}
            required
            value={zipCode}
            onChange={(e) =>
              setZipCode(formatZipCode(e.target.value))
            }
          />
        </Box>
        <TextField
          size="small"
          fullWidth
          label="Ciudad"
          placeholder="Ingresa la ciudad"
          autoCapitalize="words"
          required
          value={city}
          onChange={(e) => {
            const value = e.target.value.replace(
              /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
              "",
            );
            setCity(value.trim());
          }}
        />
        <TextField
          size="small"
          fullWidth
          label="Estado"
          placeholder="Selecciona el estado"
          required
          value={state}
          onChange={(e) => setState(e.target.value)}
          select
        >
          {estadosDeMexico.map((estado) => (
            <MenuItem
              key={estado.clave}
              value={estado.clave}
            >
              {estado.nombre}
            </MenuItem>
          ))}
        </TextField>
        <Typography variant="caption" color="error">
          <b style={{ color: "red" }}>*</b> Campos
          obligatorios
        </Typography>
      </Box>
    ),
    2: (
      <Box
        sx={{
          width: "100%",
          minHeight: "100%",
          display: "flex",
          gap: 1,
          flexDirection: "column",
        }}
      >
        <Typography variant="subtitle2">
          Pago por transferencia
        </Typography>
        <Image priority src={BVVA} alt="bbva" width={125} />
        <Typography variant="caption">
          <b>Títular:</b> Nexoroute S.A. de C.V. <br />
          <b>Banco:</b> BBVA <br />
          <b>Cuenta:</b> 1234567890 <br />
          <b>CLABE:</b> 012345678901234567 <br />
          <b>Referencia:</b>{" "}
          <i
            style={{ color: theme.palette.text.secondary }}
          >
            Se generará al confirmar la compra
          </i>
        </Typography>
      </Box>
    ),
    3: (
      <Box
        sx={{
          width: "100%",
          minHeight: "100%",
          display: "flex",
          gap: 1,
          flexDirection: "column",
        }}
      >
        <Typography variant="subtitle2">
          Pago en la tienda OXXO más cercana
        </Typography>
        <Typography variant="caption">
          1- Mencionale al cajero que desea realizar un pago
          a Nexoroute y proporcione el código de referencia
          que se generará al confirmar la compra. <br />
          2- Realice el pago en efectivo. <br />
          3- Conserve el recibo de pago que le entregará el
          cajero. <br />
        </Typography>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Schedule fontSize="small" />
          <i>Acreditación inmediata</i>
        </Typography>
      </Box>
    ),
    4: (
      <Box
        sx={{
          width: "100%",
          minHeight: "100%",
          display: "flex",
          gap: 1,
          flexDirection: "column",
        }}
      >
        <Alert severity="success">
          El pago en efectivo se realizará en ventanilla
        </Alert>
      </Box>
    ),
  };

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
          Pago
        </Typography>
        <ToggleButtonGroup
          value={metodoPagoId}
          exclusive
          onChange={handleTipoPago}
          aria-label="tipo de pago"
          sx={{
            width: "100%",
          }}
        >
          <ToggleButton
            value={1}
            aria-label="crédito/débito"
            sx={toggleButtonSx}
          >
            <CreditCard fontSize="large" />
            {!sm && (
              <Typography variant="caption">
                Crédito/Débito
              </Typography>
            )}
          </ToggleButton>
          <ToggleButton
            value={2}
            aria-label="transferencia"
            sx={toggleButtonSx}
          >
            <AccountBalanceOutlined fontSize="large" />
            {!sm && (
              <Typography variant="caption">
                Transferencia
              </Typography>
            )}
          </ToggleButton>
          <ToggleButton
            value={3}
            aria-label="oxxo"
            sx={toggleButtonSx}
          >
            <Image
              priority
              src={OXXO}
              alt="oxxo"
              width={40}
            />
            {!sm && (
              <Typography variant="caption">
                OXXO
              </Typography>
            )}
          </ToggleButton>
          <ToggleButton
            value={4}
            aria-label="efectivo"
            sx={toggleButtonSx}
          >
            <PaymentsOutlined fontSize="large" />
            {!sm && (
              <Typography variant="caption">
                Efectivo
              </Typography>
            )}
          </ToggleButton>
        </ToggleButtonGroup>
        {forms[metodoPagoId as keyof typeof forms]}
      </Box>
      <CompraSummary
        {...summaryProps}
        buttonDisbaled={!isValid}
      />
    </Box>
  );
};

const TimerText = () => {
  const theme = useTheme();

  const [minutes, setMinutes] = React.useState(10);
  const [seconds, setSeconds] = React.useState(60);

  const router = useRouter();

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else if (minutes > 0) {
        setMinutes(minutes - 1);
        setSeconds(59);
      }
    }, 1000);

    const timeout = setTimeout(
      () => {
        clearInterval(timer);
        router.replace("/");
        snack.warning({
          message:
            "Se agotó el tiempo para completar la compra.",
          duration: 2500,
        });
      },
      10 * 60 * 1000,
    ); // 10 minutos

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [minutes, seconds]);

  const displaySeconds =
    seconds < 10 ? `0${seconds}` : seconds;

  return (
    <Tooltip title="Tiempo restante para completar la compra">
      <Typography
        variant="subtitle2"
        sx={{
          color: theme.palette.text.primary,
          transition: "all 03s ease",
          "&:hover": {
            color: theme.palette.accent.main,
            fontWeight: "bold",
          },
        }}
      >
        {minutes >= 10 ? minutes : `0${minutes}`}:
        {seconds === 60 ? "00" : displaySeconds}
      </Typography>
    </Tooltip>
  );
};
