"use client";

import {
  Breadcrumb,
  CommonPageProps,
  FormButtonsRow,
  HandleResponseError,
  PaperBlock,
  PaperHeader,
} from "@nexoroute/commons";
import { ChevronLeft } from "@mui/icons-material";
import { Avatar, Box, TextField } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCreateInstitucionMutation } from "../api/institucionesApi";
import onSubmit from "../forms/onNewInstitucionSubmit";
import React from "react";
import {
  institucionSchema,
  InstitucionSchema,
} from "../validations/institucionZod";
import { institucionTemplate } from "../templates/institucionTemplate";

interface NuevaInstitucionProps extends CommonPageProps {}

export default function NuevaInstitucion({
  navigationFunction,
  openSidebar,
  closeSidebar = () => {},
  showDialog = () => {},
  snack,
  router,
  pathname,
  userRoles = [],
  userPrivileges = [],
}: Readonly<NuevaInstitucionProps>) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<InstitucionSchema>({
    resolver: zodResolver(institucionSchema),
    defaultValues: institucionTemplate,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [mutate, res] = useCreateInstitucionMutation();

  const [errores, setErrores] = React.useState<
    Record<string, string[]>
  >({});

  const doSubmit = async (data: InstitucionSchema) => {
    return await onSubmit(data, {
      snack,
      navigationFunction,
      mutate,
      setErrores,
    });
  };

  const errs = res.error as any;

  if (
    res.isError &&
    errs.data?.message !== "Error de validación"
  ) {
    return (
      <HandleResponseError
        error={res.error as any}
        router={router as any}
        path={pathname}
        onRetry={
          res.data ? undefined : handleSubmit(doSubmit)
        }
      />
    );
  }

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          {
            nombre: "Instituciones",
            href: "/dashboard/institutions",
          },
          {
            nombre: "Nuevo",
            href: "/dashboard/institutions/nuevo",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Nueva institución"
        subtitle="Agrega una nueva institución para asociarla con unidades y servicios"
        iconname="add"
        showButton
        onButtonClick={() =>
          navigationFunction("/dashboard/institutions")
        }
        buttonTitle="Volver"
        leftIcon={<ChevronLeft />}
        isLoading={res.isLoading}
      />
      <PaperBlock
        title="Datos generales"
        subtitle="Captura la informacion basica de la institucion"
        contentWrapperSx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <TextField
          label="Nombre de la institucion"
          variant="outlined"
          size="small"
          fullWidth
          {...register("nombre", {
            required:
              "El nombre de la institución es requerido",
          })}
          error={!!errors.nombre || !!errores.nombre}
          helperText={
            errors.nombre?.message ||
            errores.nombre?.join(", ") ||
            `${watch("nombre").trim().length}/50`
          }
          required
          disabled={res.isLoading}
          placeholder="Ingresa el nombre de la institución"
          autoFocus
        />
        <Box
          sx={{
            display: "flex",
            gap: 2,
          }}
        >
          {watch("imagen_url").trim().length > 0 && (
            <Avatar
              alt="logo de la institucion"
              src={watch("imagen_url").trim()}
              sx={{ width: 56, height: 56 }}
              variant="square"
            />
          )}
          <TextField
            label="Imagen de la institucion"
            variant="outlined"
            size="small"
            type="url"
            inputMode="url"
            fullWidth
            {...register("imagen_url", {
              required:
                "La imagen de la institución es requerida",
            })}
            error={
              !!errors.imagen_url || !!errores.imagen_url
            }
            helperText={
              errors.imagen_url?.message ||
              errores.imagen_url?.join(", ") ||
              `${watch("imagen_url").trim().length}/255`
            }
            required
            disabled={res.isLoading}
            placeholder="Ingresa la url de la imagen de la institución"
            autoFocus
          />
        </Box>
        <TextField
          label="Descripcion *"
          variant="outlined"
          size="small"
          fullWidth
          multiline
          rows={4}
          {...register("descripcion", {
            required:
              "La descripción de la institución es requerida",
          })}
          error={
            !!errors.descripcion || !!errores.descripcion
          }
          helperText={
            errors.descripcion?.message ||
            errores.descripcion?.join(", ") ||
            `${watch("descripcion").trim().length}/100`
          }
          required
          disabled={res.isLoading}
          placeholder="Ingresa una descripción de la institución"
        />
      </PaperBlock>
      <FormButtonsRow
        onSubmitClick={handleSubmit(doSubmit)}
        hasRequiredFields
        onResetClick={() => reset(institucionTemplate)}
        submitDisabled={!isDirty || !isValid}
        resetDisabled={!isDirty}
        isLoading={res.isLoading}
      />
    </>
  );
}
