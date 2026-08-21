import React from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ImageIcon from "@mui/icons-material/Image";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PaperBlock } from "@nexoroute/commons";
import { FormState } from "../types/ConductorForm";
import Institucion from "../../instituciones/types/Institucion";
import CalendarDateField from "./CalendarDateField";
import {
  LICENSE_CATEGORIES,
  MEXICAN_STATES,
} from "../data/licenseOptions";

interface ConductorFormProps {
  form: FormState;
  errors: Record<string, string>;
  instituciones: Institucion[];
  loadingInstituciones: boolean;
  loading: boolean;
  showLicencia?: boolean;
  onChange: (
    field: keyof FormState,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLicenciaChange: (
    field: keyof FormState["licencia"],
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange: (field: keyof FormState, value: string) => void;
  onLicenciaValueChange: (
    field: keyof FormState["licencia"],
    value: string,
  ) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function readImageAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSize = 960;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");

        if (!context) {
          resolve(String(reader.result));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.onerror = () => reject(new Error("No se pudo procesar la imagen"));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });
}

function LabeledTextField({
  fieldLabel,
  children,
  ...props
}: Readonly<
  Omit<React.ComponentProps<typeof TextField>, "label"> & {
    fieldLabel: string;
    children?: React.ReactNode;
  }
>) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      <Typography variant="body2" sx={{ fontWeight: 850 }}>
        {fieldLabel}
      </Typography>
      <TextField {...props} fullWidth>
        {children}
      </TextField>
    </Box>
  );
}

function ImageUploadField({
  label,
  value,
  error,
  helperText,
  onValueChange,
}: Readonly<{
  label: string;
  value: string;
  error?: boolean;
  helperText?: string;
  onValueChange: (value: string) => void;
}>) {
  const storesImagesAsBase64 =
    (
      process.env.NEXT_PUBLIC_IMAGE_STORAGE_MODE ||
      (process.env.NODE_ENV === "production" ? "url" : "base64")
    ) === "base64";

  return (
    <Box
      sx={{
        gridColumn: { xs: "1 / -1", md: "auto" },
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 850 }}>
        {label}
      </Typography>
      <Box
        sx={{
          minHeight: 148,
          borderRadius: "8px",
          border: "1px solid",
          borderColor: error ? "error.main" : "divider",
          bgcolor: "background.default",
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
        }}
      >
        {value ? (
          <Box
            component="img"
            src={value}
            alt={label}
            sx={{ width: "100%", height: 148, objectFit: "cover" }}
          />
        ) : (
          <Stack spacing={0.75} sx={{ alignItems: "center", color: "text.secondary" }}>
            <ImageIcon />
            <Typography variant="caption">Sin imagen</Typography>
          </Stack>
        )}
      </Box>
      {storesImagesAsBase64 ? (
        <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateIcon />}>
          Cargar imagen
          <input
            hidden
            accept="image/*"
            type="file"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              onValueChange(await readImageAsBase64(file));
              event.target.value = "";
            }}
          />
        </Button>
      ) : (
        <LabeledTextField
          fieldLabel="URL de imagen"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          error={error}
          helperText="En produccion este campo recibira la URL generada por el servicio de imagenes."
        />
      )}
      {helperText && (
        <Typography variant="caption" color={error ? "error" : "text.secondary"}>
          {helperText}
        </Typography>
      )}
      {storesImagesAsBase64 && (
        <Alert severity="info" sx={{ py: 0.25 }}>
          Local: se guarda base64 comprimido. Produccion: cambia a URL cuando se conecte AWS.
        </Alert>
      )}
    </Box>
  );
}

export default function ConductorForm({
  form,
  errors,
  instituciones,
  loadingInstituciones,
  loading,
  showLicencia = true,
  onChange,
  onLicenciaChange,
  onValueChange,
  onLicenciaValueChange,
  onSubmit,
  onCancel,
}: Readonly<ConductorFormProps>) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        alignItems: "stretch",
        "@media (max-width:900px)": {
          flexDirection: "column",
        },
      }}
    >
      <Box sx={{ width: "100%", flex: 2 }}>
        <PaperBlock title="Datos personales" subtitle="Informacion general del conductor">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" },
              gap: 2,
            }}
          >
            <LabeledTextField
              fieldLabel="Nombre(s)"
              value={form.nombres}
              onChange={onChange("nombres")}
              error={!!errors.nombres}
              helperText={errors.nombres}
            />
            <LabeledTextField
              fieldLabel="Apellido paterno"
              value={form.apellido_paterno}
              onChange={onChange("apellido_paterno")}
              error={!!errors.apellido_paterno}
              helperText={errors.apellido_paterno}
            />
            <LabeledTextField
              fieldLabel="Apellido materno"
              value={form.apellido_materno}
              onChange={onChange("apellido_materno")}
              error={!!errors.apellido_materno}
              helperText={errors.apellido_materno}
            />
            <LabeledTextField
              fieldLabel="CURP"
              value={form.curp}
              onChange={(event) =>
                onValueChange("curp", event.target.value.toUpperCase().slice(0, 18))
              }
              error={!!errors.curp}
              helperText={errors.curp}
              slotProps={{ htmlInput: { maxLength: 18 } }}
            />
            <CalendarDateField
              label="Fecha de nacimiento"
              value={form.fecha_nacimiento}
              onChange={(value) => onValueChange("fecha_nacimiento", value)}
              error={!!errors.fecha_nacimiento}
              helperText={errors.fecha_nacimiento}
            />
            <LabeledTextField
              fieldLabel="Telefono"
              value={form.telefono}
              onChange={onChange("telefono")}
              error={!!errors.telefono}
              helperText={errors.telefono}
            />
            <LabeledTextField
              fieldLabel="Correo electronico"
              value={form.email}
              onChange={onChange("email")}
              error={!!errors.email}
              helperText={errors.email}
            />
            <ImageUploadField
              label="Foto de perfil"
              value={form.foto_perfil}
              onValueChange={(value) => onValueChange("foto_perfil", value)}
              error={!!errors.foto_perfil}
              helperText={errors.foto_perfil}
            />
            <LabeledTextField
              select
              fieldLabel="Institucion"
              value={form.institucion_id}
              onChange={onChange("institucion_id")}
              disabled={loadingInstituciones}
              error={!!errors.institucion_id}
              helperText={errors.institucion_id}
            >
              {instituciones.map((institucion) => (
                <MenuItem key={institucion.id} value={institucion.id}>
                  {institucion.nombre}
                </MenuItem>
              ))}
            </LabeledTextField>
          </Box>
        </PaperBlock>

        {showLicencia && (
          <PaperBlock title="Licencia de conducir" subtitle="Informacion de la licencia vigente">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" },
                gap: 2,
              }}
            >
              <LabeledTextField
                fieldLabel="Numero de licencia"
                value={form.licencia.numero_licencia}
                onChange={(event) =>
                  onLicenciaValueChange(
                    "numero_licencia",
                    event.target.value.replace(/\D/g, "").slice(0, 12),
                  )
                }
                error={!!errors["licencia.numero_licencia"]}
                helperText={errors["licencia.numero_licencia"]}
                slotProps={{
                  htmlInput: {
                    inputMode: "numeric",
                    maxLength: 12,
                    pattern: "[0-9]*",
                  },
                }}
              />
              <LabeledTextField
                select
                fieldLabel="Categoria"
                value={form.licencia.categoria}
                onChange={onLicenciaChange("categoria")}
                error={!!errors["licencia.categoria"]}
                helperText={errors["licencia.categoria"]}
              >
                {LICENSE_CATEGORIES.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </LabeledTextField>
              <CalendarDateField
                label="Fecha de expedicion"
                value={form.licencia.fecha_expedicion}
                onChange={(value) => onLicenciaValueChange("fecha_expedicion", value)}
                error={!!errors["licencia.fecha_expedicion"]}
                helperText={errors["licencia.fecha_expedicion"]}
              />
              <CalendarDateField
                label="Fecha de vencimiento"
                value={form.licencia.fecha_vencimiento}
                onChange={(value) => onLicenciaValueChange("fecha_vencimiento", value)}
                error={!!errors["licencia.fecha_vencimiento"]}
                helperText={errors["licencia.fecha_vencimiento"]}
              />
              <LabeledTextField
                select
                fieldLabel="Estado emisor"
                value={form.licencia.estado_emisor}
                onChange={onLicenciaChange("estado_emisor")}
                error={!!errors["licencia.estado_emisor"]}
                helperText={errors["licencia.estado_emisor"]}
              >
                {MEXICAN_STATES.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </LabeledTextField>
              <ImageUploadField
                label="Imagen de licencia"
                value={form.licencia.imagen_licencia}
                onValueChange={(value) =>
                  onLicenciaValueChange("imagen_licencia", value)
                }
                error={!!errors["licencia.imagen_licencia"]}
                helperText={errors["licencia.imagen_licencia"]}
              />
            </Box>
          </PaperBlock>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={onSubmit} disabled={loading}>
            Guardar
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
