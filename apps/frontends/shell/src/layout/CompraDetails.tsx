"use client";
import React from "react";
import useCompra from "../core/hooks/useCompra";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { ArrowBack, Map } from "@mui/icons-material";
import {
  Box,
  Typography,
  Button,
  useTheme,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  EmptyState,
  MotionPaper,
} from "@nexoroute/commons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pasajero } from "../core/types/Compra";
import OXXO from "../assets/oxxo.svg";
import { RutaPrecio } from "../core/types/RutaPrecios";

type Props = {
  codigo_compra: string;
};

export default function CompraDetails({
  codigo_compra,
}: Readonly<Props>) {
  const { getCompraByCodigo } = useCompra();
  const [compra, setCompra] = React.useState<any>(null);
  const [loading, setLoading] =
    React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(
    null,
  );
  const fetchCompra = async () => {
    try {
      setLoading(true);
      const data = await getCompraByCodigo(codigo_compra);
      setCompra(data);
    } catch (error) {
      console.error("Error fetching compra:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error desconocido",
      );
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchCompra();
  }, [codigo_compra]);

  const router = useRouter();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const handleCloseDialog = () => {
    setDialogOpen(false);
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

  if (
    error &&
    error === `Compra con código ${codigo_compra} no existe`
  ) {
    return (
      <Box sx={{ margin: "auto" }}>
        <EmptyState
          title="Compra no encontrada"
          description={`No se encontró ninguna compra con el código ${codigo_compra}.`}
          variant="no-results"
          action={{
            label: "Ir a inicio",
            onClick() {
              router.replace("/");
            },
          }}
        />
      </Box>
    );
  } else if (error) {
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
          gap: "8px",
          width: "100%",
          position: "relative",
          padding: "16px",
        }}
      >
        <Typography variant="h3" className="font-brand">
          Detalles de la compra
        </Typography>
        <Divider />
        <Typography variant="h6">
          Resumen de compra
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Fecha de la compra:
            </Typography>
            <Typography variant="body2">
              {compra.fechaCompra.split("T")[0] || "-"}
            </Typography>
          </Grid>

          <Grid size={6}>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Costo:
            </Typography>
            <Typography variant="body2">
              $ {Number(compra.monto).toFixed(2) || "-"} MXN
            </Typography>
          </Grid>

          <Grid size={6}>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Estado:
            </Typography>
            <Typography variant="body2">
              {compra.estado.at(0)?.toUpperCase() +
                compra.estado.slice(1).toLowerCase() || "-"}
            </Typography>
          </Grid>

          <Grid size={6}>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Abordado:
            </Typography>
            <Typography variant="body2">
              {compra.abordado ? "Sí" : "No"}
            </Typography>
          </Grid>

          <Grid size={6}>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Metodo de pago:
            </Typography>
            {compra.pagos[0].metodoPago.nombre ===
            "OXXO" ? (
              <Image
                priority
                src={OXXO}
                alt="oxxo"
                width={50}
              />
            ) : (
              <Typography variant="body2">
                {compra.pagos[0].metodoPago.estado
                  .at(0)
                  ?.toUpperCase() +
                  compra.pagos[0].metodoPago.estado
                    .slice(1)
                    .toLowerCase() || "-"}
              </Typography>
            )}
          </Grid>

          <Grid size={6}>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Estado del pago:
            </Typography>
            <Typography variant="body2">
              {compra.pagos[0].estado.at(0)?.toUpperCase() +
                compra.pagos[0].estado
                  .slice(1)
                  .toLowerCase() || "-"}
            </Typography>
          </Grid>
        </Grid>
        <Divider />
        <Typography variant="h6">
          Datos del comprador:
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Nombre (s):
            </Typography>
            <Typography variant="body2">
              {compra.comprador?.nombres || "-"}
            </Typography>
          </Grid>

          <Grid size={6}>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Apellido paterno:
            </Typography>
            <Typography variant="body2">
              {compra.comprador?.apellido_paterno || "-"}
            </Typography>
          </Grid>

          <Grid size={6}>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Apellido materno:
            </Typography>
            <Typography variant="body2">
              {compra.comprador?.apellido_materno || "-"}
            </Typography>
          </Grid>

          <Grid size={6}>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Correo electrónico:
            </Typography>
            <Typography variant="body2">
              {compra.comprador?.email || "-"}
            </Typography>
          </Grid>

          <Grid size={6}>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Teléfono:
            </Typography>
            <Typography variant="body2">
              {compra.comprador?.telefono || "-"}
            </Typography>
          </Grid>
        </Grid>
        <Divider />
        <Typography variant="h6">
          Salida seleccionada
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Fecha:
            </Typography>
            <Typography variant="body2">
              {compra.fechaSalida || "-"}
            </Typography>
          </Grid>

          <Grid size={6}>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Hora:
            </Typography>
            <Typography variant="body2">
              {compra.horaSalida || "-"}{" "}
              {Number(compra.horaSalida.split(":")[0]) < 12
                ? "AM"
                : "PM"}
            </Typography>
          </Grid>

          <Grid size={6}>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Duración estimada:
            </Typography>
            <Typography variant="body2">
              {`${Math.floor(compra.salida.horario_configuracion.duracionMin / 60)}h ${compra.salida.horario_configuracion.duracionMin % 60}m`}
            </Typography>
          </Grid>

          <Grid size={6}>
            <Typography
              variant="caption"
              color="textSecondary"
            >
              Rutas:
            </Typography>
            <br />
            <Button
              variant="text"
              color="accent"
              size="small"
              onClick={() => setDialogOpen(true)}
            >
              Ver rutas
            </Button>
          </Grid>

          {compra.salida.horario_configuracion
            .finCalculado && (
            <Grid size={6}>
              <Typography
                variant="caption"
                color="textSecondary"
              >
                Hora de llegada estimada:
              </Typography>
              <Typography variant="body2">
                {compra.salida.horario_configuracion
                  .finCalculado.hora || "-"}{" "}
                {Number(
                  compra.salida.horario_configuracion.finCalculado.hora.split(
                    ":",
                  )[0],
                ) < 12
                  ? "AM"
                  : "PM"}
              </Typography>
            </Grid>
          )}
        </Grid>
        <Divider />
        <Typography variant="h6">
          Asientos asignados:
        </Typography>
        <TableContainer component={MotionPaper}>
          <Table
            sx={{ flex: 1, minWidth: 650 }}
            aria-label="simple table"
          >
            <TableHead>
              <TableRow>
                <TableCell>Nombres</TableCell>
                <TableCell>Apellidos</TableCell>
                <TableCell>Asiento</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {compra.asientos.map((row: Pasajero) => (
                <TableRow
                  key={row.nombres + row.apellidos}
                  sx={{
                    "&:last-child td, &:last-child th": {
                      border: 0,
                    },
                  }}
                >
                  <TableCell>{row.nombres}</TableCell>
                  <TableCell>{row.apellidos}</TableCell>
                  <TableCell>
                    {row.asiento?.label ||
                      "No seleccionado"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Dialog onClose={handleCloseDialog} open={dialogOpen}>
        <DialogTitle>Rutas del viaje</DialogTitle>
        <DialogContent>
          <List>
            {compra.salida.precios.rutas.map(
              (ruta: RutaPrecio) => (
                <ListItem disablePadding key={ruta.rutaId}>
                  <ListItemIcon>
                    <Map />
                  </ListItemIcon>
                  <ListItemText
                    primary={ruta.nombre}
                    secondary={null}
                  />
                </ListItem>
              ),
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} autoFocus>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
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
