import { Button, Box, Typography } from "@mui/material";
import {
  MotionPaper,
  ServicioIcon,
} from "@nexoroute/commons";
import { customFormatDate } from "../../utils/customFormatDate";
import Image from "next/image";

const SalidaCard = ({
  salida,
  idx,
  onClick,
  openDetailsDialog,
}: {
  salida: any;
  idx: number;
  onClick: (salida: any) => void;
  openDetailsDialog: (salida: any) => void;
}) => {
  return (
    <MotionPaper
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{
        ease: "easeInOut",
        duration: 1,
        delay: idx * 0.1,
      }}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: 4,
        gap: 2,
        flexWrap: { xs: "wrap", lg: "nowrap" },
        flexDirection: { xs: "column", lg: "row" },
      }}
    >
      {/* Bloque info: imagen + día/fecha/salida/llegada */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          gap: { xs: 2, lg: 4 },
          justifyContent: "flex-start",
          flexWrap: "wrap",
          flex: "2 1 auto",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: { xs: "100px", md: "150px" },
            height: { xs: "100px", md: "150px" },
            aspectRatio: "1/1",
            flexShrink: 0,
          }}
        >
          <Image
            src={salida.institucion.imagen_url}
            alt="bus"
            fill
            style={{ objectFit: "fill" }}
            loading="eager"
          />
        </Box>
        {salida.config.dia && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              flexWrap: "wrap",
              minWidth: 100,
              flex: "1 1 100px",
            }}
          >
            <Typography variant="h4">Día</Typography>
            <Typography variant="body2">
              {salida.config.dia}
            </Typography>
          </Box>
        )}
        {salida.config.fecha && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              flexWrap: "wrap",
              minWidth: 100,
              flex: "1 1 100px",
            }}
          >
            <Typography variant="h4">Fecha</Typography>
            <Typography variant="body2">
              {customFormatDate(salida.config.fecha)}
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            flexWrap: "wrap",
            minWidth: 120,
            flex: "1 1 120px",
          }}
        >
          <Typography variant="h4">Salida</Typography>
          <Typography variant="body2">
            {salida.config.inicio.hora}
          </Typography>
          <Typography variant="subtitle1">
            {salida.lugarSalida.direccion.split(",")[0]}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            minWidth: 120,
            flex: "1 1 120px",
          }}
        >
          <Typography variant="h4">Llegada</Typography>
          <Typography variant="body2">
            {salida.config.finCalculado.hora}
          </Typography>
          <Typography variant="subtitle1">
            {salida.lugarLlegada.direccion.split(",")[0]}
          </Typography>
        </Box>
      </Box>

      {/* Bloque amenidades + precio: antes tenía width:100% y rompía el "row" */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "space-between",
          flex: "1 1 350px",
          minWidth: { xs: "100%", lg: 350 },
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            minWidth: 140,
          }}
        >
          <Typography variant="h4">Amenidades</Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {salida.amenidades
              .slice(0, 4)
              .map((servicio: any) => (
                <ServicioIcon
                  key={servicio.id}
                  name={servicio.icono_nombre}
                />
              ))}
          </Box>
          <Button
            fullWidth
            variant="text"
            onClick={() => openDetailsDialog(salida)}
          >
            Ver más
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography variant="h4">Precio</Typography>
          <Typography variant="h5">
            {/* Ojo: revisar si es salida.precio o salida.precios según tu tipo real */}
            ${salida.precio.toFixed(2)}{" "}
            {salida.precios.moneda}
          </Typography>
        </Box>
      </Box>

      {/* Botón elegir */}
      <Box
        sx={{
          display: "flex",
          width: { xs: "100%", lg: "175px" },
          gap: 2,
          justifyContent: "center",
          alignItems: "center",
          my: "auto",
          flexShrink: 0,
        }}
      >
        <Button
          onClick={() => onClick(salida)}
          variant="contained"
          fullWidth
        >
          Elegir
        </Button>
      </Box>
    </MotionPaper>
  );
};

export default SalidaCard;
