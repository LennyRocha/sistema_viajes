import React from "react";
import { DisponibilidadServicioInput } from "../types/disponibilidad-input";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";

const DisponibilidadForm = ({
  instituciones,
  tipos_bus,
  servicioNombre,
  servicioId,
  onSubmit,
  submitLoading,
}) => {
  const [institucion, setInstitucion] = React.useState(
    instituciones[0]?.id ?? 0,
  );
  const [tipo, setTipo] = React.useState(
    tipos_bus[0]?.id ?? 0,
  );
  const [formData, setFormData] =
    React.useState<DisponibilidadServicioInput>({
      servicioId: servicioId ?? 0,
      tipoId: tipo,
      institucionId: institucion,
    });
  const { nombre } = React.useMemo(
    () =>
      instituciones.find((i) => i.id === institucion) ?? {
        nombre: "",
      },
    [institucion, instituciones],
  );
  const [loading, setLoading] = React.useState(false);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <Typography variant="body2">
        Selecciona una institución que no tenga
        disponibilidad de servicios para el servicio "
        {servicioNombre}" y un tipo de autobús para
        establecer la disponibilidad.
      </Typography>
      <TextField
        select
        required
        label="Institución"
        value={institucion}
        placeholder="Elige una institución"
        onChange={(e) => {
          setInstitucion(
            instituciones.find(
              (i) =>
                i.id === Number.parseInt(e.target.value),
            )?.id ?? 0,
          );
          setFormData((prev) => ({
            ...prev,
            institucionId: Number.parseInt(e.target.value),
          }));
        }}
        helperText={`Esta institución puede usar el servicio ${servicioNombre}...`}
        fullWidth
      >
        {instituciones.map((institucion) => (
          <MenuItem
            key={institucion.id}
            value={institucion.id}
          >
            {institucion.nombre}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        required
        label="Tipo de autobús"
        value={tipo}
        placeholder="Elige un tipo de autobus"
        onChange={(e) => {
          setTipo(Number.parseInt(e.target.value));
          setFormData((prev) => ({
            ...prev,
            tipoId: Number.parseInt(e.target.value),
          }));
        }}
        helperText="En este tipo de autobús."
        fullWidth
        autoFocus
      >
        {tipos_bus.map((tipo) => (
          <MenuItem key={tipo.id} value={tipo.id}>
            {tipo.nombre}
          </MenuItem>
        ))}
      </TextField>
      <Typography variant="caption" color="error">
        <b style={{ color: "red" }}>*</b> Campos
        obligatorios
      </Typography>
      <Button
        variant="outlined"
        color="secondary"
        size="small"
        loading={submitLoading || loading}
        onClick={async () => {
          setLoading(true);
          await onSubmit(formData, servicioNombre, nombre);
          setLoading(false);
        }}
        fullWidth
        disabled={
          formData.tipoId === 0 ||
          formData.institucionId === 0 ||
          formData.servicioId === 0
        }
      >
        Guardar
      </Button>
    </Box>
  );
};

export default DisponibilidadForm;
