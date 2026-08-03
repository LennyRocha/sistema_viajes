"use client";

import React from "react";
import {
  Breadcrumb,
  CommonPageProps,
  PaperBlock,
  PaperHeader,
} from "@nexoroute/commons";
import CancelIcon from "@mui/icons-material/Cancel";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import RouteIcon from "@mui/icons-material/Route";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { cancelSalida, getSalidas, updateSalida } from "../api/salidasHttp";
import { SalidaDetalle } from "../types/SalidasApi";

interface Props extends CommonPageProps {}

const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "default"> = {
  PROGRAMADO: "warning",
  EN_CURSO: "success",
  FINALIZADO: "success",
  CANCELADO: "error",
};

function formatCurrency(value: number | null) {
  if (value == null) return "$0.00";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

function formatDateTime(value?: Record<string, any> | string | null) {
  if (!value) return "Sin horario";

  if (typeof value === "string") {
    return value;
  }

  const fecha = value.fecha ?? "";
  const hora = value.hora ?? "";

  if (fecha && hora) return `${fecha} ${hora}`;
  if (value.fechaHoraLocal) return value.fechaHoraLocal;
  return JSON.stringify(value);
}

export default function SalidasIndex({ snack, navigationFunction }: Readonly<Props>) {
  const [salidas, setSalidas] = React.useState<SalidaDetalle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [cancelingId, setCancelingId] = React.useState<number | null>(null);
  const [reassigningId, setReassigningId] = React.useState<number | null>(null);
  const [reassignData, setReassignData] = React.useState({ autobusId: "", conductorId: "" });
  const [reassignOpen, setReassignOpen] = React.useState(false);

  const loadSalidas = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSalidas();
      setSalidas(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las salidas.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSalidas();
  }, [loadSalidas]);

  const handleCancel = React.useCallback(
    async (id: number) => {
      setCancelingId(id);
      try {
        await cancelSalida(id);
        snack?.success?.({ message: "Salida cancelada correctamente." });
        await loadSalidas();
      } catch (err) {
        snack?.error?.({
          message:
            err instanceof Error
              ? `No se pudo cancelar la salida: ${err.message}`
              : "No se pudo cancelar la salida.",
        });
      } finally {
        setCancelingId(null);
      }
    },
    [loadSalidas, snack],
  );

  const openReassign = React.useCallback((salida: SalidaDetalle) => {
    setReassigningId(salida.id);
    setReassignData({
      autobusId: String(salida.autobusId ?? ""),
      conductorId: String(salida.conductorId ?? ""),
    });
    setReassignOpen(true);
  }, []);

  const handleReassign = React.useCallback(async () => {
    if (!reassigningId) return;

    const autobusId = Number(reassignData.autobusId);
    const conductorId = Number(reassignData.conductorId);

    if (!autobusId || !conductorId) {
      snack?.error?.({ message: "Debes indicar un autobús y un conductor válidos." });
      return;
    }

    setReassigningId(reassigningId);
    try {
      await updateSalida(reassigningId, {
        autobusId,
        conductorId,
      });
      snack?.success?.({ message: "Salida reasignada correctamente." });
      setReassignOpen(false);
      await loadSalidas();
    } catch (err) {
      snack?.error?.({
        message:
          err instanceof Error
            ? `No se pudo reasignar la salida: ${err.message}`
            : "No se pudo reasignar la salida.",
      });
    } finally {
      setReassigningId(null);
    }
  }, [loadSalidas, reassignData, reassigningId, snack]);

  const total = salidas.length;
  const programadas = salidas.filter((s) => s.estadoSalida === "PROGRAMADO").length;
  const canceladas = salidas.filter((s) => s.estadoSalida === "CANCELADO").length;

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[{ nombre: "Salidas", href: "/dashboard/salidas", disabled: true }]}
      />

      <PaperHeader
        title="Salidas"
        subtitle="Listado operativo de salidas programadas, activas y canceladas"
        iconname="event_available"
        showButton
        onButtonClick={() => navigationFunction?.("/dashboard/salidas/programacion")}
        buttonTitle="Programar salida"
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2, mb: 2 }}>
        <PaperBlock title="Total" subtitle={`${total} registros`}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>{total}</Typography>
        </PaperBlock>
        <PaperBlock title="Programadas" subtitle="Pendientes por ejecutar">
          <Typography variant="h4" sx={{ fontWeight: 900, color: "warning.main" }}>{programadas}</Typography>
        </PaperBlock>
        <PaperBlock title="Canceladas" subtitle="Eventos anulados">
          <Typography variant="h4" sx={{ fontWeight: 900, color: "error.main" }}>{canceladas}</Typography>
        </PaperBlock>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : null}

      {loading ? (
        <PaperBlock title="Cargando salidas" subtitle="Consultando información activa">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CircularProgress size={22} />
            <Typography>Cargando...</Typography>
          </Stack>
        </PaperBlock>
      ) : salidas.length === 0 ? (
        <PaperBlock title="Sin salidas" subtitle="Todavía no hay salidas registradas">
          <Button variant="contained" onClick={() => navigationFunction?.("/dashboard/salidas/programacion")}>
            Programar primera salida
          </Button>
        </PaperBlock>
      ) : (
        <Stack spacing={2}>
          {salidas.map((salida) => (
            <PaperBlock
              key={salida.id}
              title={`Salida #${salida.id}`}
              subtitle={formatDateTime(salida.horario_configuracion)}
              paperProps={{ sx: { p: 0 } }}
            >
              <Box sx={{ p: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
                      {salida.viajeBase?.nombre || "Viaje base"}
                    </Typography>
                    <Chip
                      label={salida.estadoSalida}
                      color={STATUS_COLORS[salida.estadoSalida] || "default"}
                      size="small"
                    />
                  </Box>

                  <Typography variant="h5" sx={{ fontWeight: 950, color: "primary.main" }}>
                    {formatCurrency(salida.precio)}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <DirectionsBusIcon color="action" fontSize="small" />
                      <Typography>
                        Autobús: {salida.autobus?.alias || salida.autobusId} · {salida.autobus?.modelo || "Sin modelo"}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonIcon color="action" fontSize="small" />
                      <Typography>Conductor: #{salida.conductorId}</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <RouteIcon color="action" fontSize="small" />
                      <Typography>
                        Tipo: {salida.tipoSalida}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EventAvailableIcon color="action" fontSize="small" />
                      <Typography>
                        Hora: {salida.horaSalida || "Sin hora"}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOnIcon color="action" fontSize="small" />
                      <Typography>
                        Salida: {salida.lugarSalida ? JSON.stringify(salida.lugarSalida) : "Sin lugar"}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOnIcon color="action" fontSize="small" />
                      <Typography>
                        Llegada: {salida.lugarLlegada ? JSON.stringify(salida.lugarLlegada) : "Sin lugar"}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => openReassign(salida)}
                    disabled={salida.estadoSalida === "CANCELADO"}
                  >
                    Reasignar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    disabled={salida.estadoSalida === "CANCELADO" || cancelingId === salida.id}
                    onClick={() => void handleCancel(salida.id)}
                  >
                    {cancelingId === salida.id ? "Cancelando..." : "Cancelar salida"}
                  </Button>
                </Box>
              </Box>
            </PaperBlock>
          ))}
        </Stack>
      )}

      <Dialog open={reassignOpen} onClose={() => setReassignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reasignar salida</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Autobús ID"
              type="number"
              value={reassignData.autobusId}
              onChange={(event) =>
                setReassignData((prev) => ({ ...prev, autobusId: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Conductor ID"
              type="number"
              value={reassignData.conductorId}
              onChange={(event) =>
                setReassignData((prev) => ({ ...prev, conductorId: event.target.value }))
              }
              fullWidth
            />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={() => setReassignOpen(false)}>Cancelar</Button>
              <Button variant="contained" onClick={() => void handleReassign()}>
                Guardar reasignación
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
