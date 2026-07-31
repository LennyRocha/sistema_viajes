import { Box, MenuItem, TextField, Button, Stack } from "@mui/material";
import {
  PaperBlock,
  FormButtonsRow,
} from "@nexoroute/commons";

import { FormState } from "../types/ConductorForm";
import Institucion from "../../instituciones/types/Institucion";

interface ConductorFormProps {
  form: FormState;
  errors: Record<string, string>;
  instituciones: Institucion[];
  loadingInstituciones: boolean;
  loading: boolean;
  showLicencia?: boolean;

  onChange: (
    field: keyof FormState
  ) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  onLicenciaChange: (
    field: keyof FormState["licencia"]
  ) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  onSubmit: () => void;
  onCancel: () => void;
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
      <Box
        sx={{
          width: "100%",
          flex: 2,
        }}
      >
        {/* ===================================== */}
        {/* DATOS PERSONALES */}
        {/* ===================================== */}

        <PaperBlock
          title="Datos personales"
          subtitle="Información general del conductor"
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2,1fr)",
              },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Nombre(s)"
              value={form.nombres}
              onChange={onChange("nombres")}
              error={!!errors.nombres}
              helperText={errors.nombres}
            />

            <TextField
              fullWidth
              label="Apellido paterno"
              value={form.apellido_paterno}
              onChange={onChange("apellido_paterno")}
              error={!!errors.apellido_paterno}
              helperText={errors.apellido_paterno}
            />

            <TextField
              fullWidth
              label="Apellido materno"
              value={form.apellido_materno}
              onChange={onChange("apellido_materno")}
              error={!!errors.apellido_materno}
              helperText={errors.apellido_materno}
            />

            <TextField
              fullWidth
              label="CURP"
              value={form.curp}
              onChange={onChange("curp")}
              error={!!errors.curp}
              helperText={errors.curp}
            />

            <TextField
              fullWidth
              type="date"
              value={form.fecha_nacimiento}
              onChange={onChange("fecha_nacimiento")}
              error={!!errors.fecha_nacimiento}
              helperText={errors.fecha_nacimiento}
            />

            <TextField
              fullWidth
              label="Teléfono"
              value={form.telefono}
              onChange={onChange("telefono")}
              error={!!errors.telefono}
              helperText={errors.telefono}
            />

            <TextField
              fullWidth
              label="Correo electrónico"
              value={form.email}
              onChange={onChange("email")}
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              fullWidth
              label="Foto de perfil"
              value={form.foto_perfil}
              onChange={onChange("foto_perfil")}
              error={!!errors.foto_perfil}
              helperText={errors.foto_perfil}
            />

            <TextField
              select
              fullWidth
              label="Institución"
              value={form.institucion_id}
              onChange={onChange("institucion_id")}
              disabled={loadingInstituciones}
              error={!!errors.institucion_id}
              helperText={errors.institucion_id}
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
          </Box>
        </PaperBlock>

        {/* ===================================== */}
        {/* LICENCIA */}
        {/* ===================================== */}

        {showLicencia && (
          <PaperBlock
            title="Licencia de conducir"
            subtitle="Información de la licencia vigente"
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2,1fr)",
                },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Número de licencia"
                value={form.licencia.numero_licencia}
                onChange={onLicenciaChange(
                  "numero_licencia"
                )}
                error={
                  !!errors["licencia.numero_licencia"]
                }
                helperText={
                  errors["licencia.numero_licencia"]
                }
              />

              <TextField
                fullWidth
                label="Categoría"
                value={form.licencia.categoria}
                onChange={onLicenciaChange("categoria")}
                error={!!errors["licencia.categoria"]}
                helperText={
                  errors["licencia.categoria"]
                }
              />

              <TextField
                fullWidth
                type="date"
                value={form.licencia.fecha_expedicion}
                onChange={onLicenciaChange(
                  "fecha_expedicion"
                )}
                error={
                  !!errors[
                  "licencia.fecha_expedicion"
                  ]
                }
                helperText={
                  errors[
                  "licencia.fecha_expedicion"
                  ]
                }
              />

              <TextField
                fullWidth
                type="date"
                value={form.licencia.fecha_vencimiento}
                onChange={onLicenciaChange(
                  "fecha_vencimiento"
                )}
                error={
                  !!errors[
                  "licencia.fecha_vencimiento"
                  ]
                }
                helperText={
                  errors[
                  "licencia.fecha_vencimiento"
                  ]
                }
              />

              <TextField
                fullWidth
                label="Estado emisor"
                value={form.licencia.estado_emisor}
                onChange={onLicenciaChange(
                  "estado_emisor"
                )}
                error={
                  !!errors["licencia.estado_emisor"]
                }
                helperText={
                  errors["licencia.estado_emisor"]
                }
              />

              <TextField
                fullWidth
                label="Imagen de licencia"
                value={form.licencia.imagen_licencia}
                onChange={onLicenciaChange(
                  "imagen_licencia"
                )}
                error={
                  !!errors[
                  "licencia.imagen_licencia"
                  ]
                }
                helperText={
                  errors[
                  "licencia.imagen_licencia"
                  ]
                }
              />
            </Box>
          </PaperBlock>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            variant="outlined"
            onClick={onCancel}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={loading}
          >
            Guardar
          </Button>
        </Box>
      </Box>
    </Box>
  );
}