import { Button, Box, Typography } from "@mui/material";
import {
  MotionPaper,
  ServicioIcon,
} from "@nexoroute/commons";
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
        flexWrap: "wrap",
        flexDirection: { xs: "column", lg: "row" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flex: 2,
          gap: 2,
          justifyContent: "space-evenly",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: { xs: "100px", md: "150px" },
            height: { xs: "100px", md: "150px" },
            aspectRatio: "1/1",
          }}
        >
          <Image
            src={salida.autobus.institucion.imagen_url}
            alt="bus"
            fill
            style={{ objectFit: "fill" }}
            loading="eager"
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="h4">Salida</Typography>
          <Typography variant="body2">
            {salida.horario_configuracion.inicio.hora}
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
          }}
        >
          <Typography variant="h4">Llegada</Typography>
          <Typography variant="body2">
            {salida.horario_configuracion.finCalculado.hora}
          </Typography>
          <Typography variant="subtitle1">
            {salida.lugarLlegada.direccion.split(",")[0]}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flex: 2,
          gap: 2,
          justifyContent: "space-evenly",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
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
            {salida.autobus.servicios
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
            ${salida.precio.toFixed(2)}{" "}
            {salida.precios.moneda}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flex: 1,
          gap: 2,
          justifyContent: "center",
          alignItems: "center",
          my: "auto",
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
