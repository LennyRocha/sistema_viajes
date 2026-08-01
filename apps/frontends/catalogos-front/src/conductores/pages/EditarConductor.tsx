import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  CommonPageProps,
  PaperHeader,
} from "@nexoroute/commons";
import { ChevronLeft } from "@mui/icons-material";

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

interface EditarConductorProps extends CommonPageProps {
  id?: string;
}

export default function EditarConductor({
  navigationFunction,
  snack,
  id,
}: Readonly<EditarConductorProps>) {
  const conductorId = id ? Number(id) : undefined;

  const [form, setForm] = useState<FormState>(initialState);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    data: conductor,
    isLoading: loadingConductor,
  } = useGetConductorByIdQuery(conductorId!, {
    skip: !conductorId,
  });

  const {
    data: instituciones,
    isLoading: loadingInstituciones,
  } = useGetInstitucionesQuery({
    active: true,
  });

  const [patchConductor, { isLoading }] =
    usePatchConductorMutation();

  useEffect(() => {
    if (!conductor) return;

    const fechaNacimiento = conductor.fecha_nacimiento
      ? new Date(conductor.fecha_nacimiento).toISOString().slice(0, 10)
      : "";

    setForm({
      nombres: conductor.nombres,
      apellido_paterno: conductor.apellido_paterno,
      apellido_materno: conductor.apellido_materno,
      curp: conductor.curp,
      fecha_nacimiento: fechaNacimiento,
      telefono: conductor.telefono,
      email: conductor.email,
      foto_perfil: conductor.foto_perfil,
      institucion_id: conductor.institucion_id,
      licencia:
        conductor.licencia ?? initialState.licencia,
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

  const handleSubmit = async (
    e?: React.FormEvent | React.MouseEvent
  ) => {
    e?.preventDefault?.();

    if (!conductorId) return;

    const payload = {
      ...form,
      institucion_id: Number(form.institucion_id),
    };

    const result = updateConductorSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path.join(".")] = issue.message;
      });

      setErrors(fieldErrors);

      snack?.error?.("Revisa los campos marcados.");

      return;
    }

    setErrors({});

    try {
      await patchConductor({
        id: conductorId,
        ...(result.data as UpdateConductorSchema),
      }).unwrap();

      snack?.success?.("Conductor actualizado correctamente");

      navigationFunction("/dashboard/conductores");
    } catch (err: any) {
      console.error(err);

      snack?.error?.(
        err?.data?.message ??
        "No se pudo actualizar el conductor"
      );
    }
  };

  if (!conductorId) {
    return (
      <div style={{ padding: 20 }}>
        ID de conductor inválido.
      </div>
    );
  }

  if (loadingConductor) {
    return (
      <div style={{ padding: 20 }}>
        Cargando conductor...
      </div>
    );
  }

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
        loading={isLoading}
        showLicencia={false}
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