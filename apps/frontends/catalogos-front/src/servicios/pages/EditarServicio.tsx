import React from "react";
import {
  PaperHeader,
  Breadcrumb,
  PaperBlock,
  FormButtonsRow,
  CommonPageProps,
  EmptyState,
  ServicioIcon,
  Tabla,
  Simplify,
  HandleResponseError,
} from "@nexoroute/commons";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { Add, ChevronLeft } from "@mui/icons-material";
import CustomIconPicker from "../components/CustomIconPicker";
import { useForm } from "react-hook-form";
import onSubmit from "../forms/onUpdateServicioSubmit";
import PropiedadServicioContent from "../components/PropiedadServicioContent";
import buildServiceProperyColumns from "../utils/buildServiceProperyColumns";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  servicioSchema,
  ServicioSchema,
} from "../validations/servicioZod";
import { CampoConfigSchema } from "../validations/campoZod";
import {
  useGetServicioByNameQuery,
  usePatchServicioMutation,
} from "../api/serviciosApi";
import { skipToken } from "@reduxjs/toolkit/query";
import CampoConfig from "../types/CampoServicio";

interface EditarServicioProps extends CommonPageProps {
  servicioName?: string;
}

export default function EditarServicio({
  navigationFunction,
  openSidebar,
  closeSidebar = () => {},
  showDialog = () => {},
  snack,
  router,
  userPrivileges = [],
  servicioName,
  pathname,
}: Readonly<EditarServicioProps>) {
  const query = useGetServicioByNameQuery(
    servicioName ?? skipToken,
  );

  if (!servicioName) {
    return (
      <EmptyState
        variant="warning"
        title="Parámetro de servicio no definido"
        description="No se ha especificado un servicio para editar"
        action={{
          label: "volver atrás",
          onClick() {
            router?.replace("/dashboard/services");
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
        title="Servicio no encontrado"
        description="El servicio especificado no existe"
        fullHeight
        action={{
          label: "volver atrás",
          onClick() {
            router?.replace("/dashboard/services");
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
      servicioName={servicioName}
      navigationFunction={navigationFunction}
      openSidebar={openSidebar}
      closeSidebar={closeSidebar}
      showDialog={showDialog}
      snack={snack}
      router={router}
      userPrivileges={userPrivileges}
      pathname={pathname}
    />
  );
}

type PropiedadRow = Simplify<CampoConfigSchema>;

const Form = ({
  query,
  navigationFunction,
  openSidebar,
  closeSidebar = () => {},
  showDialog = () => {},
  snack,
  router,
  userPrivileges,
  pathname,
  servicioName,
}: EditarServicioProps & {
  query: any;
}) => {
  const data = {
    ...query.data,
    propiedades: query.data.propiedades?.map((p: any) => ({
      ...p,
      uuid: String(p.uuid),
    })) as unknown as CampoConfigSchema[],
  };
  const template: ServicioSchema =
    servicioSchema.parse(data);
  const {
    register,
    handleSubmit,
    reset,
    trigger,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<ServicioSchema>({
    resolver: zodResolver(servicioSchema),
    defaultValues: template,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [mutate, res] = usePatchServicioMutation();

  const [errores, setErrores] = React.useState<
    Record<string, string[]>
  >({});

  const doSubmit = async (data: ServicioSchema) => {
    return await onSubmit(data, query.data?.id ?? -1, {
      snack,
      navigationFunction,
      mutate,
      setErrores,
    });
  };

  const icon_name = watch("icono_nombre") ?? "room-service";
  const pendingIconRef = React.useRef(icon_name);

  const handleOpenIconPicker = () => {
    pendingIconRef.current = icon_name; // arranca desde el valor actual
    showDialog({
      title: "Elegir un icono",
      content: (
        <CustomIconPicker
          value={icon_name}
          onChange={(newIcon) => {
            pendingIconRef.current = newIcon;
          }}
        />
      ),
      showCloseButton: true,
      showCancelButton: true,
      onClose: () => {},
      onConfirm: () => {
        setValue("icono_nombre", pendingIconRef.current);
        trigger("icono_nombre");
      },
      confirmText: "Seleccionar",
      confirmDisabled: false,
    });
  };

  const propiedades = watch("propiedades") ?? [];

  const columnas = buildServiceProperyColumns();
  const rows = propiedades.map((propiedad, index) => ({
    ...propiedad,
    id: propiedad.clave || index,
  }));

  const errs = res.error as any;
  const propertyErrors = Object.entries(
    errs?.data?.errors ?? {},
  ).filter(([field]) => field.startsWith("propiedades."));

  const loading =
    query.isLoading || query.isFetching || res.isLoading;

  if (
    res.error &&
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

  const now = new Date().toISOString();

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          {
            nombre: "Servicios",
            href: "/dashboard/services",
            disabled: loading,
          },
          {
            nombre: servicioName ?? "Editar",
            href: `/dashboard/services/${servicioName}`,
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Actualizar servicio"
        subtitle="Modifica los datos de un servicio existente"
        iconname="edit"
        showButton
        onButtonClick={() =>
          navigationFunction("/dashboard/services")
        }
        buttonTitle="Volver"
        leftIcon={<ChevronLeft />}
        isLoading={loading}
      />
      <PaperBlock
        title="Datos generales del servicio"
        subtitle="Define el nombre con el se identificará a este servicio e ingresa sus respectivos datos de identificación adicional"
        contentWrapperSx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <TextField
          label="Nombre del servicio"
          variant="outlined"
          size="small"
          {...register("nombre", {
            required: "El nombre del servicio es requerido",
          })}
          error={!!errors.nombre || !!errores.nombre}
          helperText={
            errors.nombre?.message ||
            errores.nombre?.join(", ") ||
            `${watch("nombre").trim().length}/50`
          }
          fullWidth
          required
          autoFocus
          placeholder="Ingresa el nombre del servicio"
        />
        <TextField
          label="Descripción"
          variant="outlined"
          size="small"
          {...register("descripcion", {
            required:
              "La descripción del servicio es requerida",
          })}
          error={
            !!errors.descripcion || !!errores.descripcion
          }
          helperText={
            errors.descripcion?.message ||
            errores.descripcion?.join(", ") ||
            `${watch("descripcion").trim().length}/500`
          }
          fullWidth
          multiline
          rows={4}
          required
          placeholder="Ingresa una descripción del servicio"
        />
      </PaperBlock>
      <PaperBlock
        title="Icono representativo"
        subtitle="Selecciona un ícono que representará este servicio o puedes dejar el ícono que se muestra por defecto"
        contentWrapperSx={{
          display: "flex",
          flexDirection: "row",
          gap: "12px",
        }}
      >
        <Box
          sx={(theme) => ({
            backgroundColor: alpha(
              theme.palette.accent.main,
              0.08,
            ),
            borderRadius: 2,
            width: 75,
            height: 75,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <ServicioIcon
            name={watch("icono_nombre") ?? "room-service"}
            size="xxxl"
            color="accent"
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="overline"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Icono actual:{" "}
            {watch("icono_nombre") ?? "room-service"}
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenIconPicker}
            loading={loading}
          >
            Cambiar icono
          </Button>
        </Box>
      </PaperBlock>
      <PaperBlock
        title="Propiedades del servicio"
        subtitle="Define caracerísticas especificas de este servicio para se deben establecer en el registro de un autobús. Agrega al menos una propiedad para continuar, máximo 12 propiedades"
        contentWrapperSx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" gutterBottom>
            {" "}
            {propiedades?.length ?? 0}/12 propiedades
            definidas
          </Typography>
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() =>
              openSidebar({
                title: "Nueva propiedad de servicio",
                children: (
                  <PropiedadServicioContent
                    key={`nueva-${crypto.randomUUID()}`}
                    propiedades={propiedades}
                    setValue={setValue}
                    closeSidebar={closeSidebar}
                    readonly={false}
                  />
                ),
              })
            }
            disabled={(propiedades?.length ?? 0) >= 12}
            loading={loading}
          >
            Agregar
          </Button>
        </Box>
        {rows.length === 0 ? (
          <EmptyState
            variant="no-data"
            title="Sin propiedades definidas"
          />
        ) : (
          <Tabla<PropiedadRow>
            columnas={columnas}
            data={rows}
            isLoading={loading}
            onEditClick={(row) =>
              openSidebar({
                title: "Editar propiedad de servicio",
                children: (
                  <PropiedadServicioContent
                    key={`editar-${row.uuid}-${now}`}
                    propiedades={propiedades}
                    setValue={setValue}
                    closeSidebar={closeSidebar}
                    readonly={false}
                    propiedad={row}
                    editMode={true}
                  />
                ),
              })
            }
            onDeleteClick={(row) => {
              closeSidebar();
              const remaining = rows.filter(
                (prop: any) => prop.uuid !== row.uuid,
              );
              setValue("propiedades", remaining, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          />
        )}
        {propertyErrors.length > 0 && (
          <ul>
            {propertyErrors.map(
              ([field, messages]: [string, string[]]) => {
                const fields = field.split(".");
                const index = fields[1];
                const propertyField = fields[2];
                const current = propiedades[
                  index as any
                ] as CampoConfig;
                return (
                  <li key={field}>
                    <Typography
                      variant="caption"
                      color="error"
                    >
                      <strong>
                        {`${current?.clave}.${propertyField}`}
                        :{" "}
                      </strong>{" "}
                      {messages.join(", ")}
                    </Typography>
                  </li>
                );
              },
            )}
          </ul>
        )}
      </PaperBlock>
      <FormButtonsRow
        onSubmitClick={handleSubmit(doSubmit)}
        hasRequiredFields
        onResetClick={() => reset(template)}
        submitDisabled={!isDirty || !isValid}
        resetDisabled={!isDirty}
        isLoading={loading}
      />
    </>
  );
};
