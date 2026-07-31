import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  CommonPageProps,
  PaperHeader,
} from "@nexoroute/commons";

import { ChevronLeft } from "@mui/icons-material";

import { useParams } from "next/navigation";

import ConductorForm from "../components/ConductorForms";

import {
  FormState,
  initialState,
} from "../types/ConductorForm";

import {
  updateConductorSchema,
  UpdateConductorSchema,
} from "../validations/conductorZod";

import {
  useGetConductorByIdQuery,
  usePatchConductorMutation,
} from "../api/conductorApi";

import { useGetInstitucionesQuery } from "../../instituciones/api/institucionesApi";

interface EditarConductorProps extends CommonPageProps { }

export default function EditarConductor({
  navigationFunction,
  snack,
}: Readonly<EditarConductorProps>) {
  const { id } = useParams();

  const [form, setForm] =
    useState<FormState>(initialState);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const { data: conductor } =
    useGetConductorByIdQuery(Number(id));

  const { data: instituciones, isLoading: loadingInstituciones } =
    useGetInstitucionesQuery({
      active: true,
    });

  const [patchConductor, { isLoading }] =
    usePatchConductorMutation();

  useEffect(() => {
    if (!conductor) return;

    setForm({
      nombres: conductor.nombres,
      apellido_paterno: conductor.apellido_paterno,
      apellido_materno: conductor.apellido_materno,
      curp: conductor.curp,
      fecha_nacimiento:
        conductor.fecha_nacimiento.slice(0, 10),
      telefono: conductor.telefono,
      email: conductor.email,
      foto_perfil: conductor.foto_perfil,
      institucion_id: conductor.institucion_id,
      licencia: conductor.licencia ?? initialState.licencia
    });
  }, [conductor]);

  const handleChange =
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
          ...prev,
          [field]: e.target.value,
        }));
      };

  const handleLicenciaChange =
    (_: keyof FormState["licencia"]) =>
      (_e: React.ChangeEvent<HTMLInputElement>) => { };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      institucion_id: Number(form.institucion_id),
    };

    const result =
      updateConductorSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path.join(".")] =
          issue.message;
      });

      setErrors(fieldErrors);

      snack?.(
        "Revisa los campos marcados.",
        "error",
      );

      return;
    }

    setErrors({});

    try {
      await patchConductor({
        id: Number(id),
        ...(result.data as UpdateConductorSchema),
      }).unwrap();

      snack?.(
        "Conductor actualizado correctamente",
        "success",
      );

      navigationFunction("/dashboard/conductores");
    } catch (err: any) {
      snack?.(
        err?.data?.message ??
        "No se pudo actualizar el conductor",
        "error",
      );
    }
  };

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          {
            nombre: "Conductores",
            href: "/conductores",
          },
          {
            nombre: "Editar",
            href: "#",
            disabled: true,
          },
        ]}
      />

      <PaperHeader
        title="Editar conductor"
        subtitle="Actualiza la información del conductor"
        iconname="edit"
        showButton
        buttonTitle="Volver"
        leftIcon={<ChevronLeft />}
        onButtonClick={() =>
          navigationFunction("/dashboard/conductores")
        }
      />

      <ConductorForm
        form={form}
        errors={errors}
        instituciones={instituciones ?? []}
        loadingInstituciones={loadingInstituciones}
        loading={isLoading}
        showLicencia={false}
        onChange={handleChange}
        onLicenciaChange={handleLicenciaChange}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigationFunction("/dashboard/conductores")
        }
      />
    </>
  );
}