import React, { useState } from "react";
import {
  PaperHeader,
  Breadcrumb,
  PaperBlock,
  FormButtonsRow,
  CommonPageProps,
} from "@nexoroute/commons";
import {
  Box,
  TextField,
  MenuItem,
} from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import { useCreateConductorMutation } from "../api/conductorApi";
import { useGetInstitucionesQuery } from "../../instituciones/api/institucionesApi";
import { conductorSchema, ConductorSchema } from "../validations/conductorZod";

interface NuevoConductorProps extends CommonPageProps {}

type FormState = {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  foto_perfil: string;
  institucion_id: number | "";
  licencia: {
    numero_licencia: string;
    categoria: string;
    fecha_expedicion: string;
    fecha_vencimiento: string;
    estado_emisor: string;
    imagen_licencia: string;
    vigente: boolean;
  };
};

const initialState: FormState = {
  nombres: "",
  apellido_paterno: "",
  apellido_materno: "",
  curp: "",
  fecha_nacimiento: "",
  telefono: "",
  email: "",
  foto_perfil: "",
  institucion_id: "",
  licencia: {
    numero_licencia: "",
    categoria: "",
    fecha_expedicion: "",
    fecha_vencimiento: "",
    estado_emisor: "",
    imagen_licencia: "",
    vigente: true,
  },
};

export default function NuevoConductor({
  navigationFunction,
  openSidebar,
  snack,
  userPrivileges = [],
}: Readonly<NuevoConductorProps>) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: instituciones, isLoading: loadingInstituciones } =
    useGetInstitucionesQuery({ active: true });

  const [createConductor, { isLoading: isSaving }] =
    useCreateConductorMutation();

  const handleChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleLicenciaChange = (
    field: keyof FormState["licencia"],
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      licencia: { ...prev.licencia, [field]: e.target.value },
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      institucion_id:
        form.institucion_id === "" ? 0 : Number(form.institucion_id),
    };

    console.log(payload);

    const result = conductorSchema.safeParse(payload);

    console.log(result);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path.join(".")] = issue.message;
      }
      setErrors(fieldErrors);
      snack?.("Revisa los campos marcados en rojo", "error");
      return;
    }

    setErrors({});

    try {
      await createConductor(result.data as ConductorSchema).unwrap();
      snack?.("Conductor creado correctamente", "success");
      navigationFunction("/dashboard/conductores");
    } catch (error) {
      console.error(error);
      snack?.("No se pudo crear el conductor", "error");
    }
  };

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          { nombre: "Conductores", href: "/conductores" },
          {
            nombre: "Nuevo",
            href: "/conductores/nuevo",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Nuevo conductor"
        subtitle="Agrega un nuevo conductor para que pueda operar en los viajes"
        iconname="add"
        showButton
        onButtonClick={() => navigationFunction("/dashboard/conductores")}
        buttonTitle="Volver"
        leftIcon={<ChevronLeft />}
      />
      <Box
        sx={{
          display: "flex",
          gap: "12px",
          alignItems: "stretch",
          "@media (max-width: 768px)": {
            flexDirection: "column",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            "@media (min-width: 640px)": {
              flex: 2,
            },
          }}
        >
          <PaperBlock
            title="Datos personales"
            subtitle="Información básica del conductor"
            contentWrapperSx={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: "12px",
                "@media (max-width: 640px)": { flexDirection: "column" },
              }}
            >
              <TextField
                label="Nombre(s) *"
                variant="outlined"
                size="small"
                fullWidth
                value={form.nombres}
                onChange={handleChange("nombres")}
                error={!!errors.nombres}
                helperText={errors.nombres}
              />
              <TextField
                label="Apellido paterno *"
                variant="outlined"
                size="small"
                fullWidth
                value={form.apellido_paterno}
                onChange={handleChange("apellido_paterno")}
                error={!!errors.apellido_paterno}
                helperText={errors.apellido_paterno}
              />
              <TextField
                label="Apellido materno *"
                variant="outlined"
                size="small"
                fullWidth
                value={form.apellido_materno}
                onChange={handleChange("apellido_materno")}
                error={!!errors.apellido_materno}
                helperText={errors.apellido_materno}
              />
            </Box>
            <TextField
              label="CURP *"
              variant="outlined"
              size="small"
              fullWidth
              value={form.curp}
              onChange={handleChange("curp")}
              error={!!errors.curp}
              helperText={errors.curp}
            />
            <TextField
              label="Email *"
              variant="outlined"
              type="email"
              size="small"
              fullWidth
              value={form.email}
              onChange={handleChange("email")}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Teléfono *"
              variant="outlined"
              size="small"
              fullWidth
              value={form.telefono}
              onChange={handleChange("telefono")}
              error={!!errors.telefono}
              helperText={errors.telefono}
            />
            <TextField
              label="Fecha de nacimiento *"
              variant="outlined"
              type="date"
              size="small"
              fullWidth
              value={form.fecha_nacimiento}
              onChange={handleChange("fecha_nacimiento")}
              error={!!errors.fecha_nacimiento}
              helperText={errors.fecha_nacimiento}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Foto de perfil (URL) *"
              variant="outlined"
              size="small"
              fullWidth
              value={form.foto_perfil}
              onChange={handleChange("foto_perfil")}
              error={!!errors.foto_perfil}
              helperText={errors.foto_perfil}
            />
            <TextField
              select
              label="Institución *"
              variant="outlined"
              size="small"
              fullWidth
              value={form.institucion_id}
              onChange={handleChange("institucion_id")}
              error={!!errors.institucion_id}
              helperText={errors.institucion_id}
              disabled={loadingInstituciones}
            >
              {(instituciones ?? []).map((institucion) => (
                <MenuItem key={institucion.id} value={institucion.id}>
                  {institucion.nombre}
                </MenuItem>
              ))}
            </TextField>
          </PaperBlock>

          <PaperBlock
            title="Información de licencia"
            subtitle="Datos de la licencia de conducir"
            contentWrapperSx={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <TextField
              label="Número de licencia *"
              variant="outlined"
              size="small"
              fullWidth
              value={form.licencia.numero_licencia}
              onChange={handleLicenciaChange("numero_licencia")}
              error={!!errors["licencia.numero_licencia"]}
              helperText={errors["licencia.numero_licencia"]}
            />
            <TextField
              label="Categoría *"
              variant="outlined"
              size="small"
              fullWidth
              value={form.licencia.categoria}
              onChange={handleLicenciaChange("categoria")}
              error={!!errors["licencia.categoria"]}
              helperText={errors["licencia.categoria"]}
            />
            <Box
              sx={{
                display: "flex",
                gap: "12px",
                "@media (max-width: 640px)": { flexDirection: "column" },
              }}
            >
              <TextField
                label="Fecha de expedición *"
                variant="outlined"
                type="date"
                size="small"
                fullWidth
                value={form.licencia.fecha_expedicion}
                onChange={handleLicenciaChange("fecha_expedicion")}
                error={!!errors["licencia.fecha_expedicion"]}
                helperText={errors["licencia.fecha_expedicion"]}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Fecha de vencimiento *"
                variant="outlined"
                type="date"
                size="small"
                fullWidth
                value={form.licencia.fecha_vencimiento}
                onChange={handleLicenciaChange("fecha_vencimiento")}
                error={!!errors["licencia.fecha_vencimiento"]}
                helperText={errors["licencia.fecha_vencimiento"]}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <TextField
              label="Estado emisor *"
              variant="outlined"
              size="small"
              fullWidth
              value={form.licencia.estado_emisor}
              onChange={handleLicenciaChange("estado_emisor")}
              error={!!errors["licencia.estado_emisor"]}
              helperText={errors["licencia.estado_emisor"]}
            />
            <TextField
              label="Imagen de licencia (URL) *"
              variant="outlined"
              size="small"
              fullWidth
              value={form.licencia.imagen_licencia}
              onChange={handleLicenciaChange("imagen_licencia")}
              error={!!errors["licencia.imagen_licencia"]}
              helperText={errors["licencia.imagen_licencia"]}
            />
          </PaperBlock>

          <FormButtonsRow
            showCancelButton
            showSubmitButton
            cancelButtonText="Cancelar"
            submitButtonText="Guardar"
            onCancel={() => navigationFunction("/dashboard/conductores")}
            onSubmit={handleSubmit}
            submitDisabled={isSaving}
          />
        </Box>
      </Box>
    </>
  );
}