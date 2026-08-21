import React from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import Conductor from "../types/Conductor";
import {
  licenciaBaseSchema,
  renewLicenciaSchema,
} from "../validations/licenciaZod";
import {
  usePatchLicenciaVigenteByConductorMutation,
  useRenewLicenciaVigenteByConductorMutation,
} from "../api/licenciaApi";
import CalendarDateField from "./CalendarDateField";
import {
  LICENSE_CATEGORIES,
  MEXICAN_STATES,
} from "../data/licenseOptions";

type LicenciaFormState = {
  numero_licencia: string;
  categoria: string;
  fecha_expedicion: string;
  fecha_vencimiento: string;
  estado_emisor: string;
  imagen_licencia: string;
};

type Props = {
  open: boolean;
  conductor: Conductor | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
};

const today = () => new Date().toISOString().slice(0, 10);

const toDateInput = (value?: string) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const buildInitialForm = (conductor: Conductor | null): LicenciaFormState => ({
  numero_licencia: conductor?.licencia?.numero_licencia ?? "",
  categoria: conductor?.licencia?.categoria ?? "",
  fecha_expedicion: toDateInput(conductor?.licencia?.fecha_expedicion),
  fecha_vencimiento: toDateInput(conductor?.licencia?.fecha_vencimiento),
  estado_emisor: conductor?.licencia?.estado_emisor ?? "",
  imagen_licencia: conductor?.licencia?.imagen_licencia ?? "",
});

const buildRenewForm = (conductor: Conductor | null): LicenciaFormState => ({
  ...buildInitialForm(conductor),
  fecha_expedicion: today(),
  fecha_vencimiento: "",
});

export default function LicenciaGestionDialog({
  open,
  conductor,
  onClose,
  onSuccess,
  onError,
}: Readonly<Props>) {
  const [tab, setTab] = React.useState<"patch" | "renew">("patch");
  const [form, setForm] = React.useState<LicenciaFormState>(
    buildInitialForm(conductor),
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [patchVigente, patchState] =
    usePatchLicenciaVigenteByConductorMutation();
  const [renewVigente, renewState] =
    useRenewLicenciaVigenteByConductorMutation();

  const isLoading = patchState.isLoading || renewState.isLoading;
  const hasLicencia = Boolean(conductor?.licencia);

  React.useEffect(() => {
    if (!open) return;
    setTab("patch");
    setErrors({});
    setForm(buildInitialForm(conductor));
  }, [open, conductor]);

  const handleTabChange = (_: React.SyntheticEvent, value: "patch" | "renew") => {
    setTab(value);
    setErrors({});
    setForm(value === "patch" ? buildInitialForm(conductor) : buildRenewForm(conductor));
  };

  const handleChange =
    (field: keyof LicenciaFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleDateChange = (field: keyof LicenciaFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const mapErrors = (issues: { path: PropertyKey[]; message: string }[]) => {
    const nextErrors: Record<string, string> = {};
    issues.forEach((issue) => {
      nextErrors[issue.path.map(String).join(".")] = issue.message;
    });
    return nextErrors;
  };

  const handleSubmit = async () => {
    if (!conductor) return;

    if (tab === "patch") {
      const result = licenciaBaseSchema.safeParse({
        ...form,
        vigente: true,
      });

      if (!result.success) {
        setErrors(mapErrors(result.error.issues));
        return;
      }

      try {
        await patchVigente({
          conductor_id: conductor.id,
          ...result.data,
        }).unwrap();
        onSuccess?.("Licencia vigente actualizada correctamente");
        onClose();
      } catch (error: any) {
        onError?.(error?.data?.message ?? "No se pudo actualizar la licencia vigente");
      }
      return;
    }

    const result = renewLicenciaSchema.safeParse(form);

    if (!result.success) {
      setErrors(mapErrors(result.error.issues));
      return;
    }

    try {
      await renewVigente({
        conductor_id: conductor.id,
        ...result.data,
      }).unwrap();
      onSuccess?.("Licencia renovada correctamente");
      onClose();
    } catch (error: any) {
      onError?.(error?.data?.message ?? "No se pudo renovar la licencia");
    }
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Licencia del conductor</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {[conductor?.nombres, conductor?.apellido_paterno, conductor?.apellido_materno]
                .filter(Boolean)
                .join(" ") || "Conductor"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {hasLicencia
                ? `Licencia vigente: ${conductor?.licencia?.numero_licencia}`
                : "Este conductor no tiene licencia vigente registrada."}
            </Typography>
          </Box>

          <Tabs value={tab} onChange={handleTabChange}>
            <Tab value="patch" label="Corregir vigente" disabled={!hasLicencia} />
            <Tab value="renew" label="Renovar" disabled={!hasLicencia} />
          </Tabs>

          {!hasLicencia ? (
            <Alert severity="warning">
              Registra una licencia desde el módulo de licencias antes de usar estas opciones.
            </Alert>
          ) : (
            <>
              {tab === "patch" && (
                <Alert severity="info">
                  Esta opción corrige datos de captura sobre la licencia vigente.
                </Alert>
              )}
              {tab === "renew" && (
                <Alert severity="info">
                  Esta opción conserva historial: crea una nueva licencia vigente y marca la anterior como no vigente.
                </Alert>
              )}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                  gap: 2,
                }}
              >
                <TextField
                  label="Numero de licencia"
                  value={form.numero_licencia}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      numero_licencia: event.target.value.replace(/\D/g, "").slice(0, 12),
                    }))
                  }
                  error={!!errors.numero_licencia}
                  helperText={errors.numero_licencia}
                  fullWidth
                  slotProps={{
                    htmlInput: { inputMode: "numeric", maxLength: 12, pattern: "[0-9]*" },
                  }}
                />
                <TextField
                  select
                  label="Categoria"
                  value={form.categoria}
                  onChange={handleChange("categoria")}
                  error={!!errors.categoria}
                  helperText={errors.categoria}
                  fullWidth
                >
                  {LICENSE_CATEGORIES.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </TextField>
                <CalendarDateField
                  label="Fecha de expedicion"
                  value={form.fecha_expedicion}
                  onChange={(value) => handleDateChange("fecha_expedicion", value)}
                  error={!!errors.fecha_expedicion}
                  helperText={errors.fecha_expedicion}
                />
                <CalendarDateField
                  label="Fecha de vencimiento"
                  value={form.fecha_vencimiento}
                  onChange={(value) => handleDateChange("fecha_vencimiento", value)}
                  error={!!errors.fecha_vencimiento}
                  helperText={errors.fecha_vencimiento}
                />
                <TextField
                  select
                  label="Estado emisor"
                  value={form.estado_emisor}
                  onChange={handleChange("estado_emisor")}
                  error={!!errors.estado_emisor}
                  helperText={errors.estado_emisor}
                  fullWidth
                >
                  {MEXICAN_STATES.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Imagen de licencia"
                  value={form.imagen_licencia}
                  onChange={handleChange("imagen_licencia")}
                  error={!!errors.imagen_licencia}
                  helperText={errors.imagen_licencia}
                  fullWidth
                />
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !hasLicencia}
        >
          {tab === "patch" ? "Actualizar vigente" : "Renovar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
