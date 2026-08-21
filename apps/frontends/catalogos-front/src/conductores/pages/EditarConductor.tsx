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
  useUploadConductorImageMutation,
} from "../api/conductorApi";

import { useGetInstitucionesQuery } from "../../instituciones/api/institucionesApi";
import { persistConductorImage } from "../utils/imageUpload";

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
  const [uploadImage, { isLoading: isUploading }] =
    useUploadConductorImageMutation();

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

      snack?.error?.({ message: "Revisa los campos marcados." });

      return;
    }

    setErrors({});

    try {
      const fotoPerfil = result.data.foto_perfil
        ? await persistConductorImage(
            result.data.foto_perfil,
            "profiles",
            uploadImage,
          )
        : undefined;

      await patchConductor({
        id: conductorId,
        ...(result.data as UpdateConductorSchema),
        ...(fotoPerfil ? { foto_perfil: fotoPerfil } : {}),
      }).unwrap();

      snack?.success?.({ message: "Conductor actualizado correctamente" });

      navigationFunction("/dashboard/conductores");
    } catch (err: any) {
      console.error(err);

      snack?.error?.({
        message:
          err?.data?.message ??
          "No se pudo actualizar el conductor",
      });
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
        loading={isLoading || isUploading}
        showLicencia={false}
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
