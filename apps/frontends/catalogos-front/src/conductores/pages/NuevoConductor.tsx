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

import { useCreateConductorMutation } from "../api/conductorApi";
import { useGetInstitucionesQuery } from "../../instituciones/api/institucionesApi";

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
      
      // 2. Validación más segura para evitar "snack is not a function"
      if (typeof snack === "function") {
        snack("Revisa los campos marcados en rojo", "error");
      }
      return;
    }

    setErrors({});

    try {
      console.log("Enviando...", result.data);

      const response = await createConductor(
        result.data as ConductorSchema
      ).unwrap();

      console.log("Respuesta:", response);

      if (typeof snack === "function") {
        snack("Conductor creado correctamente", "success");
      }

      console.log("Navegando...");

      // 3. Validación segura de la navegación
      if (typeof navigationFunction === "function") {
        navigationFunction("/dashboard/conductores");
      }

      console.log("Ya navegué");
    } catch (err: any) {
      console.error(err);
      if (typeof snack === "function") {
        snack(
          err?.data?.message ?? "No se pudo crear el conductor",
          "error"
        );
      }
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
        loading={isSaving}
        showLicencia
        onChange={handleChange}
        onLicenciaChange={handleLicenciaChange}
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