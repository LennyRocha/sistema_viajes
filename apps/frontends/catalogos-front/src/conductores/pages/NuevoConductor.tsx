import React, { useState } from "react";
import {
  PaperHeader,
  Breadcrumb,
  CommonPageProps,
} from "@nexoroute/commons";
import { ChevronLeft } from "@mui/icons-material";

import ConductorForm from "../components/ConductorForms";

import {
  FormState,
  initialState,
} from "../types/ConductorForm";

import {
  conductorSchema,
  ConductorSchema,
} from "../validations/conductorZod";

import {
  useCreateConductorMutation,
  useUploadConductorImageMutation,
} from "../api/conductorApi";
import { useGetInstitucionesQuery } from "../../instituciones/api/institucionesApi";
import { persistConductorImage } from "../utils/imageUpload";

interface NuevoConductorProps extends CommonPageProps {}

export default function NuevoConductor({
  navigationFunction,
  snack,
}: Readonly<NuevoConductorProps>) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: instituciones, isLoading: loadingInstituciones } =
    useGetInstitucionesQuery({ active: true });

  const [createConductor, { isLoading: isSaving }] =
    useCreateConductorMutation();
  const [uploadImage, { isLoading: isUploading }] =
    useUploadConductorImageMutation();

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleLicenciaChange =
    (field: keyof FormState["licencia"]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        licencia: {
          ...prev.licencia,
          [field]: e.target.value,
        },
      }));
    };

  const handleValueChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLicenciaValueChange = (
    field: keyof FormState["licencia"],
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      licencia: {
        ...prev.licencia,
        [field]: value,
      },
    }));
  };

  // 1. Añadimos el evento como parámetro para prevenir la recarga
  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    // Evita que el navegador recargue la página
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    const payload = {
      ...form,
      institucion_id:
        form.institucion_id === ""
          ? 0
          : Number(form.institucion_id),
    };

    const result = conductorSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path.join(".")] = issue.message;
      });

      setErrors(fieldErrors);
      
      snack?.error?.({ message: "Revisa los campos marcados en rojo" });
      return;
    }

    setErrors({});

    try {
      const [fotoPerfil, imagenLicencia] = await Promise.all([
        persistConductorImage(result.data.foto_perfil, "profiles", uploadImage),
        persistConductorImage(
          result.data.licencia.imagen_licencia,
          "licenses",
          uploadImage,
        ),
      ]);

      const persistedPayload: ConductorSchema = {
        ...result.data,
        foto_perfil: fotoPerfil,
        licencia: {
          ...result.data.licencia,
          imagen_licencia: imagenLicencia,
        },
      };

      const response = await createConductor(
        persistedPayload,
      ).unwrap();

      console.log("Respuesta:", response);

      snack?.success?.({ message: "Conductor creado correctamente" });

      console.log("Navegando...");

      // 3. Validación segura de la navegación
      if (typeof navigationFunction === "function") {
        navigationFunction("/dashboard/conductores");
      }

      console.log("Ya navegué");
    } catch (err: any) {
      console.error(err);
      snack?.error?.({
        message: err?.data?.message ?? "No se pudo crear el conductor",
      });
    }
  };

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          {
            nombre: "Conductores",
            href: "/dashboard/conductores",
          },
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
        buttonTitle="Volver"
        leftIcon={<ChevronLeft />}
        onButtonClick={() => {
          if (typeof navigationFunction === "function") {
            navigationFunction("/dashboard/conductores");
          }
        }}
      />

      <ConductorForm
        form={form}
        errors={errors}
        instituciones={instituciones ?? []}
        loadingInstituciones={loadingInstituciones}
        loading={isSaving || isUploading}
        showLicencia
        onChange={handleChange}
        onLicenciaChange={handleLicenciaChange}
        onValueChange={handleValueChange}
        onLicenciaValueChange={handleLicenciaValueChange}
        onSubmit={handleSubmit}
        onCancel={() => {
          if (typeof navigationFunction === "function") {
            navigationFunction("/dashboard/conductores");
          }
        }}
      />
    </>
  );
}
