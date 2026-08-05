import {
  Box,
  Button,
  Divider,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { MotionPaper } from "@nexoroute/commons";
import Image from "next/image";

type TipoViaje = "ida" | "vuelta";

const CompraSummary = ({
  tipo = "ida",
}: {
  tipo: TipoViaje;
}) => {
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
        Viaje de ida
      </Typography>
      <SummaryHeader
        imageSize={tipo === "ida" ? "double" : "single"}
        institucionUrl="https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-original-577x577/s3/092010/estrelladeoro.png?itok=LhInlmU8"
        fecha="28 Jul 26"
        hora="08:00 AM"
        origen="Cuernavaca"
        destino="México Taxqueña"
      />
      {tipo === "vuelta" && (
        <>
          <Typography variant="h5" gutterBottom>
            Viaje de vuelta
          </Typography>
          <SummaryHeader
            imageSize="single"
            institucionUrl="https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-original-577x577/s3/092010/estrelladeoro.png?itok=LhInlmU8"
            fecha="28 Jul 26"
            hora="08:00 AM"
            origen="Cuernavaca"
            destino="México Taxqueña"
          />
        </>
      )}
      <Typography variant="subtitle2" gutterBottom>
        01 adulto(s) $208.00
      </Typography>
      <Divider />
      <SummaryRow label="Viaje de ida" value="$208.00" />
      <SummaryRow label="Subtotal" value="$208.00" />
      <SummaryRow label="IVA" value="$33.28" />
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
            $212.00 MXN
          </Typography>
        </Box>
        <Typography variant="caption">
          Todos los precios incluyen IVA
        </Typography>
      </Box>
      <Button size="large" variant="contained">
        Continuar
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
