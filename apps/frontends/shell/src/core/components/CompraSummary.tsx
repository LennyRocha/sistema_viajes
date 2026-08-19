import {
  Box,
  Button,
  Divider,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { MotionPaper } from "@nexoroute/commons";
import Image from "next/image";
import { RutaPrecio } from "../types/RutaPrecios";

export type CompraSummaryProps = {
  tipo: TipoViaje;
  buttonDisbaled?: boolean;
  buttonLoading?: boolean;
  buttonText?: string;
  onClickButton?: () => void;
  institucion_url?: string;
  precio_salida: number;
  pasajeros: number;
  origen: string;
  destino: string;
  moneda?: string;
  rutas: RutaPrecio[];
  duracion: number;
  fecha_inicio: string;
  hora_inicio: string;
};

type TipoViaje = "ida" | "vuelta";

const CompraSummary = ({
  tipo = "ida",
  buttonDisbaled = false,
  buttonLoading = false,
  buttonText = "Continuar",
  onClickButton,
  institucion_url,
  precio_salida = 208,
  pasajeros = 1,
  origen,
  destino,
  moneda = "MXN",
  rutas = [],
  duracion,
  fecha_inicio,
  hora_inicio,
}: CompraSummaryProps) => {
  const iva = precio_salida * 0.16;
  return (
    <MotionPaper
      layoutId="summary"
      sx={{
        display: "flex",
        flexDirection: "column",
        width: { xs: "100%", md: 350 },
        height: "fit-content",
        gap: 2,
        flexGrow: 0,
        flexShrink: 0,
        padding: 2,
      }}
    >
      <Typography variant="h5" gutterBottom>
        Viaje por {rutas.length} rutas
      </Typography>
      <SummaryHeader
        imageSize={"double"}
        institucionUrl={
          institucion_url ||
          "https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-original-577x577/s3/092010/estrelladeoro.png?itok=LhInlmU8"
        }
        fecha={fecha_inicio}
        hora={`${hora_inicio} ${Number(hora_inicio.split(":")[0]) >= 12 ? "PM" : "AM"}`}
        origen={origen}
        destino={destino}
      />
      <Typography variant="subtitle2" gutterBottom>
        0{pasajeros} adulto(s) $
        {(precio_salida * pasajeros).toFixed(2)} {moneda}
      </Typography>
      <Divider />
      <SummaryRow
        label="Duración aproximada"
        value={`${Math.floor(duracion / 60)} h ${duracion % 60}m`}
      />
      {rutas
        .toSorted((a, b) => a.orden - b.orden)
        .map((ruta) => (
          <SummaryRow
            key={ruta.orden}
            label={`Ruta '${ruta.nombre}'`}
            value={`$${ruta.precio.toFixed(2)} ${moneda} *`}
          />
        ))}
      <SummaryRow
        label="Subtotal"
        value={`$${precio_salida.toFixed(2)} ${moneda}`}
      />
      <SummaryRow
        label="IVA"
        value={`$${(iva * pasajeros).toFixed(2)} ${moneda}`}
      />
      <Divider />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          py: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold" }}
          >
            Total
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold" }}
          >
            $
            {((precio_salida + iva) * pasajeros).toFixed(2)}{" "}
            {moneda}
          </Typography>
        </Box>
        <Typography variant="caption">
          * Precio individual por pasajero, incluye IVA y
          cargos por servicio.
        </Typography>
      </Box>
      <Button
        size="large"
        variant="contained"
        disabled={buttonDisbaled}
        loading={buttonLoading}
        onClick={onClickButton}
      >
        {buttonText}
      </Button>
    </MotionPaper>
  );
};

const SummaryRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.5,
      }}
    >
      <Typography variant="caption">{label}</Typography>
      <Typography
        variant="caption"
        sx={{ fontWeight: "bold" }}
      >
        {value}
      </Typography>
    </Box>
  );
};

const SummaryHeader = ({
  fecha,
  hora,
  origen,
  destino,
  institucionUrl,
  imageSize = "single",
}: {
  fecha: string;
  hora: string;
  origen: string;
  destino: string;
  institucionUrl: string;
  imageSize: "single" | "double" | "triple";
}) => {
  const sizes = {
    single: { width: 50, height: 50 },
    double: { width: 75, height: 75 },
    triple: { width: 100, height: 100 },
  };
  const { width, height } = sizes[imageSize];
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
      }}
    >
      <Image
        src={institucionUrl}
        alt="Institución"
        width={width}
        height={height}
        style={{ objectFit: "contain" }}
        loading="eager"
      />
      <Divider sx={{ my: 1 }} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        <Typography variant="caption">
          {fecha} - {hora}
        </Typography>
        <Typography variant="caption">
          <b>Origen:</b> {origen}
        </Typography>
        <Typography variant="caption">
          <b>Destino:</b> {destino}
        </Typography>
      </Box>
    </Box>
  );
};

export default CompraSummary;
