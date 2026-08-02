import {
  Breadcrumb,
  CommonPageProps,
  EmptyState,
  FormButtonsRow,
  HandleResponseError,
  PaperBlock,
  PaperHeader,
} from "@nexoroute/commons";
import { skipToken } from "@reduxjs/toolkit/query/react";
import React from "react";
import {
  useCreateInstitucionMutation,
  useGetInstitucionByNameQuery,
  usePatchInstitucionMutation,
} from "../api/institucionesApi";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "@mui/icons-material";
import { Avatar, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import onSubmit from "../forms/onUpdateInstitucionSubmit";
import {
  InstitucionSchema,
  institucionSchema,
} from "../validations/institucionZod";

interface EditarInstitucionProps extends CommonPageProps {
  institucionNombre: string;
}

export default function EditarInstitucion({
  navigationFunction,
  openSidebar,
  closeSidebar = () => {},
  showDialog = () => {},
  snack,
  router,
  pathname,
  userPrivileges = [],
  userRoles = [],
  institucionNombre,
}: Readonly<EditarInstitucionProps>) {
  const query = useGetInstitucionByNameQuery(
    institucionNombre ?? skipToken,
  );

  if (!institucionNombre) {
    return (
      <EmptyState
        variant="warning"
        title="Parámetro de institución no definido"
        description="No se ha especificado una institución para editar"
        action={{
          label: "volver atrás",
          onClick() {
            router?.replace("/dashboard/institutions");
          },
        }}
        fullHeight
      />
    );
  }

  if (query.isLoading || query.isFetching) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress
          size="3rem"
          aria-label="Loading…"
        />
      </Box>
    );
  }

  if (!query.data) {
    return (
      <EmptyState
        variant="no-data"
        title="Institución no encontrada"
        description="La institución especificada no existe"
        fullHeight
        action={{
          label: "volver atrás",
          onClick() {
            router?.replace("/dashboard/institutions");
          },
        }}
      />
    );
  }

  if (query.isError) {
    return (
      <HandleResponseError
        error={query.error as any}
        router={router as any}
        path={pathname}
        onRetry={query.refetch}
      />
    );
  }

  return (
    <Form
      query={query}
      institucionNombre={institucionNombre}
      navigationFunction={navigationFunction}
      openSidebar={openSidebar}
      closeSidebar={closeSidebar}
      showDialog={showDialog}
      snack={snack}
      router={router}
      pathname={pathname}
      userRoles={userRoles}
      userPrivileges={userPrivileges}
    />
  );
}

const Form = ({
  query,
  institucionNombre,
  navigationFunction,
  openSidebar,
  closeSidebar = () => {},
  showDialog = () => {},
  snack,
  router,
  pathname,
  userRoles = [],
  userPrivileges = [],
}: Readonly<EditarInstitucionProps & { query: any }>) => {
  const template: InstitucionSchema =
    institucionSchema.parse(query.data);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<InstitucionSchema>({
    resolver: zodResolver(institucionSchema),
    defaultValues: template,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [mutate, res] = usePatchInstitucionMutation();

  const [errores, setErrores] = React.useState<
    Record<string, string[]>
  >({});

  const doSubmit = async (data: InstitucionSchema) => {
    return await onSubmit(data, query.data?.id ?? -1, {
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
            nombre: institucionNombre ?? "Editar",
            href: `/dashboard/institutions/${institucionNombre}`,
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Editar institución"
        subtitle="Modifica los datos de una institución existente"
        iconname="edit"
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
        onResetClick={() => reset(template)}
        submitDisabled={!isDirty || !isValid}
        resetDisabled={!isDirty}
        isLoading={res.isLoading}
      />
    </>
  );
};
