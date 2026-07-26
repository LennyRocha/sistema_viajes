import React from "react";
import {
  Breadcrumb,
  CommonPageProps,
  EmptyState,
  FormButtonsRow,
  getYearsList,
  HandleResponseError,
  PaperBlock,
  PaperHeader,
} from "@nexoroute/commons";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetAutobusByCodigoInternoQuery,
  usePatchAutobusMutation,
} from "../api/autobusApi";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "@mui/icons-material";
import { TextField, MenuItem } from "@mui/material";
import { useForm } from "react-hook-form";
import { useGetDisponibilidadMatchingQuery } from "../../disponibilidad-servicios/api/disponibilidadApi";
import { useGetInstitucionesQuery } from "../../instituciones/api/institucionesApi";
import { useGetTiposAutobusQuery } from "../../tipos_autobus/api/tiposAutobusApi";
import Modelo3DName from "../../tipos_autobus/types/Modelo3DName";
import AsientoSimbología from "../components/AsientoSimbología";
import BusMap from "../components/BusMap";
import SelectorServicios from "../components/SelectorServicios";
import VehiculoPreview from "../components/VehiculoPreview";
import {
  plantillaPremium,
  plantillaEstandar,
  plantillaShuttle,
} from "../constants/asientosPlantilla";
import onSubmit from "../forms/onUpdateAutobusSubmit";
import { AsientoEstado } from "../types/AsientoEstado";
import {
  AutobusSchema,
  autobusSchema,
} from "../validations/autobusZod";
import { getAutobusDirtyValues } from "../utils/getAutobusDirtyValues";
import { mapAutobusResponseToFormValues } from "../utils/mapAutobusResponse";

interface EditarServicioProps extends CommonPageProps {
  codigo_interno?: string;
}

export default function EditarAutobus({
  navigationFunction,
  openSidebar,
  closeSidebar = () => {},
  showDialog = () => {},
  snack,
  router,
  pathname,
  codigo_interno,
  userPrivileges = [],
}: Readonly<EditarServicioProps>) {
  const query = useGetAutobusByCodigoInternoQuery(
    codigo_interno ?? skipToken,
  );

  if (!codigo_interno) {
    return (
      <EmptyState
        variant="warning"
        title="Parámetro de autobús no definido"
        description="No se ha especificado un autobús para editar"
        action={{
          label: "volver atrás",
          onClick() {
            router?.replace("/dashboard/buses");
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
        title="Autobús no encontrado"
        description="El autobús con el código interno especificado no existe"
        fullHeight
        action={{
          label: "volver atrás",
          onClick() {
            router?.replace("/dashboard/buses");
          },
        }}
      />
    );
  }

  if (query.error) {
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
      navigationFunction={navigationFunction}
      openSidebar={openSidebar}
      closeSidebar={closeSidebar}
      showDialog={showDialog}
      snack={snack}
      router={router}
      pathname={pathname}
      codigo_interno={codigo_interno}
      userPrivileges={userPrivileges}
    />
  );
}

const Form = ({
  query,
  navigationFunction,
  openSidebar,
  closeSidebar = () => {},
  showDialog = () => {},
  snack,
  router,
  pathname,
  codigo_interno,
  userPrivileges = [],
}: Readonly<EditarServicioProps & { query: any }>) => {
  const template: AutobusSchema = autobusSchema.parse(
    mapAutobusResponseToFormValues(query.data),
  );
  const {
    register,
    handleSubmit,
    reset,
    trigger,
    setValue,
    watch,
    getValues,
    formState: { errors, isDirty, isValid, dirtyFields },
  } = useForm<AutobusSchema>({
    resolver: zodResolver(autobusSchema),
    defaultValues: template,
    mode: "all",
    reValidateMode: "onChange",
  });

  const [errores, setErrores] = React.useState<
    Record<string, string[]>
  >({});

  const [mutate, res] = usePatchAutobusMutation();
  const tiposQuery = useGetTiposAutobusQuery();
  const institucionesQuery = useGetInstitucionesQuery({
    active: true,
  });

  const doSubmit = async (data: AutobusSchema) => {
    const values = getValues();
    const payload = getAutobusDirtyValues(
      dirtyFields,
      values,
    );
    return await onSubmit(payload, query.data.id, {
      snack,
      navigationFunction,
      mutate,
      setErrores,
    });
  };

  const errs = res.error as any;

  const modelos: Record<number, Modelo3DName> = {
    1: "hyundai",
    2: "volkswagen",
    3: "mercedes",
  };

  const asientosMap = {
    1: plantillaPremium,
    2: plantillaEstandar,
    3: plantillaShuttle,
  };

  React.useEffect(() => {
    setValue(
      "asientos",
      asientosMap[watch("tipo_autobus_id")],
      { shouldValidate: true, shouldDirty: true },
    );
    const capacidad = watch("asientos").filter(
      (asiento) =>
        asiento.estado !== AsientoEstado.OUT_OF_SERVICE,
    ).length;
    setValue("capacidad", capacidad, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [watch("tipo_autobus_id"), watch("asientos")]);

  const modelo = React.useMemo(() => {
    return modelos[watch("tipo_autobus_id")];
  }, [watch("tipo_autobus_id")]);

  const params = React.useMemo(() => {
    return {
      tipoBusId: watch("tipo_autobus_id"),
      institucionId: watch("institucion_id"),
    };
  }, [watch("tipo_autobus_id"), watch("institucion_id")]);

  const resetServicios = () => {
    setValue("servicios", [], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const disponiblesQuery =
    useGetDisponibilidadMatchingQuery(params);

  const filteredUnselectedServices = React.useMemo(() => {
    const servicios = watch("servicios");
    if (!disponiblesQuery.data) return [];
    if (servicios.length === 0)
      return disponiblesQuery.data;
    return disponiblesQuery.data.filter(
      (disponible) =>
        !servicios.some(
          (servicio) =>
            servicio.servicioId === disponible.id,
        ),
    );
  }, [disponiblesQuery.data, watch("servicios")]);

  const loading =
    res.isLoading ||
    tiposQuery.isLoading ||
    institucionesQuery.isLoading ||
    disponiblesQuery.isLoading;

  if (
    tiposQuery.isLoading ||
    institucionesQuery.isLoading
  ) {
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

  if (
    tiposQuery.isError ||
    (res.error &&
      errs.data?.message !== "Error de validación")
  ) {
    return (
      <HandleResponseError
        error={(res.error as any) || tiposQuery.error}
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
          { nombre: "Autobuses", href: "/dashboard/buses" },
          {
            nombre: codigo_interno ?? "Editar",
            href: `/dashboard/buses/editar/${codigo_interno}`,
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Actualizar autobús"
        subtitle="Modifica los datos de un autobús existente"
        iconname="edit"
        showButton
        onButtonClick={() =>
          navigationFunction("/dashboard/buses")
        }
        buttonTitle="Volver"
        leftIcon={<ChevronLeft />}
        isLoading={
          res.isLoading ||
          tiposQuery.isLoading ||
          institucionesQuery.isLoading ||
          disponiblesQuery.isLoading
        }
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
            title="Datos generales"
            subtitle="Define el alias con el se identificará a esta unidad e ingresa sus respectivos datos de identificación adicional"
            contentWrapperSx={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <TextField
              label="Alias del autobús"
              variant="outlined"
              size="small"
              {...register("alias", {
                required:
                  "El alias del autobús es obligatorio",
              })}
              helperText={
                errors.alias?.message ||
                errores.alias?.join(", ") ||
                `${watch("alias").trim().length}/25`
              }
              error={!!errors.alias || !!errores.alias}
              required
              disabled={loading}
              placeholder="El alias es un nombre único para identificar este autobús"
              autoFocus
              fullWidth
              slotProps={{
                htmlInput: {
                  maxLength: 25,
                  minLength: 1,
                },
              }}
            />
            <TextField
              label="Descripción"
              variant="outlined"
              size="small"
              fullWidth
              multiline
              rows={4}
              {...register("descripcion", {
                required:
                  "La descripción del autobús es obligatoria",
              })}
              helperText={
                errors.descripcion?.message ||
                errores.descripcion?.join(", ") ||
                `${watch("descripcion").trim().length}/255`
              }
              error={
                !!errors.descripcion ||
                !!errores.descripcion
              }
              placeholder="Describe el autobús, por ejemplo: Autobús para viajes de larga distancia, Autobús para transporte escolar, etc."
              required
              disabled={loading}
              slotProps={{
                htmlInput: {
                  maxLength: 255,
                  minLength: 1,
                },
              }}
            />
            <Box
              sx={{
                display: "flex",
                gap: "12px",
                "@media (max-width: 640px)": {
                  flexDirection: "column",
                  flexWrap: "wrap-reverse",
                },
              }}
            >
              <TextField
                label="Código interno"
                variant="outlined"
                size="small"
                {...register("codigo_interno", {
                  required:
                    "El código interno es obligatorio",
                  pattern: {
                    value: /^[A-Za-z0-9-]+$/,
                    message:
                      "Solo se permiten letras, números y guiones.",
                  },
                })}
                fullWidth
                placeholder="Identificador único ej: BUS-001, BUS-002, etc."
                helperText={
                  errors.codigo_interno?.message ||
                  errores.codigo_interno?.join(", ") ||
                  `${watch("codigo_interno").trim().length}/10`
                }
                error={
                  !!errors.codigo_interno ||
                  !!errores.codigo_interno
                }
                slotProps={{
                  htmlInput: {
                    maxLength: 10,
                    minLength: 1,
                  },
                }}
                required
              />
              <TextField
                label="Institución perteneciente"
                variant="outlined"
                size="small"
                required
                fullWidth
                value={watch("institucion_id")}
                onChange={(e) => {
                  setValue(
                    "institucion_id",
                    Number(e.target.value),
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    },
                  );
                  resetServicios();
                }}
                select
                disabled={institucionesQuery.isLoading}
                defaultValue={
                  institucionesQuery.data?.[0]?.id ?? ""
                }
                helperText={
                  errors.institucion_id?.message ||
                  errores.institucion_id?.join(", ")
                }
                error={
                  !!errors.institucion_id ||
                  !!errores.institucion_id
                }
              >
                {institucionesQuery.data?.map((option) => (
                  <MenuItem
                    key={option.id}
                    value={option.id}
                  >
                    {option.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <TextField
              fullWidth
              select
              required
              label="Tipo de autobús"
              value={watch("tipo_autobus_id")}
              onChange={(e) => {
                setValue(
                  "tipo_autobus_id",
                  Number(e.target.value),
                  {
                    shouldValidate: true,
                    shouldDirty: true,
                  },
                );
                resetServicios();
              }}
              disabled={tiposQuery.isLoading}
              defaultValue={tiposQuery.data?.[0]?.id ?? ""}
              size="small"
              error={
                !!errors.tipo_autobus_id ||
                !!errores.tipo_autobus_id
              }
            >
              {tiposQuery.data?.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.nombre}
                </MenuItem>
              ))}
            </TextField>
          </PaperBlock>
        </Box>
        <VehiculoPreview model={modelo} />
      </Box>
      <PaperBlock
        title="Datos del vehículo"
        subtitle="Define las especificaciones técnicas de la unidad y su capacidad de pasajeros"
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
            "@media (max-width: 640px)": {
              flexDirection: "column",
            },
          }}
        >
          <TextField
            label="Marca"
            variant="outlined"
            size="small"
            slotProps={{
              htmlInput: {
                maxLength: 50,
                minLength: 1,
              },
            }}
            required
            {...register("marca", {
              required:
                "La marca del autobús es obligatoria",
            })}
            placeholder="Ingresa la marca del autobús."
            helperText={
              errors.marca?.message ||
              errores.marca?.join(", ") ||
              `${watch("marca").trim().length}/50`
            }
            error={!!errors.marca || !!errores.marca}
            fullWidth
          />
          <TextField
            label="Modelo"
            variant="outlined"
            size="small"
            slotProps={{
              htmlInput: {
                maxLength: 50,
                minLength: 1,
              },
            }}
            required
            placeholder="Ingresa el modelo del autobús."
            {...register("modelo", {
              required:
                "El modelo del autobús es obligatorio",
            })}
            helperText={
              errors.modelo?.message ||
              errores.modelo?.join(", ") ||
              `${watch("modelo").trim().length}/50`
            }
            error={!!errors.modelo || !!errores.modelo}
            fullWidth
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: "12px",
            "@media (max-width: 640px)": {
              flexDirection: "column",
            },
          }}
        >
          <TextField
            label="Año de fabricación"
            required
            variant="outlined"
            size="small"
            fullWidth
            value={watch("ano")}
            onChange={(e) =>
              setValue("ano", Number(e.target.value), {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            select
          >
            {getYearsList().map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Capacidad total"
            variant="outlined"
            size="small"
            type="number"
            inputMode="numeric"
            value={watch("capacidad")}
            slotProps={{
              htmlInput: {
                readOnly: true,
              },
            }}
            required
            fullWidth
          />
        </Box>
        <TextField
          label="Color"
          variant="outlined"
          size="small"
          {...register("color", {
            required: "El color del autobús es obligatorio",
          })}
          fullWidth
          slotProps={{
            htmlInput: {
              maxLength: 50,
              minLength: 1,
            },
          }}
          required
          placeholder="Ingresa el color del autobús."
          helperText={
            errors.color?.message ||
            errores.color?.join(", ") ||
            `${watch("color").trim().length}/50`
          }
          error={!!errors.color || !!errores.color}
        />
      </PaperBlock>
      <PaperBlock
        title="Distribución de asientos"
        subtitle="Define la disponibilidad de los asientos del autobús. Toca en un asienta para cambiar su estado. Los asientos fuera de servicio no se podrán seleccionar al momento de crear un viaje."
        contentWrapperSx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <Box
          sx={{
            width: "fit-content",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BusMap
            asientos={watch("asientos")}
            canClickOnOutOfService={true}
            idTipo={watch("tipo_autobus_id")}
            onSelectAsiento={(asiento) => {
              const asientos = [...watch("asientos")];
              const index = asientos.findIndex(
                (a) => a.id === asiento.id,
              );
              if (index !== -1) {
                const found = asientos[index];
                if (
                  found.estado ===
                  AsientoEstado.OUT_OF_SERVICE
                ) {
                  found.estado = AsientoEstado.AVAILABLE;
                } else if (
                  found.estado === AsientoEstado.AVAILABLE
                ) {
                  found.estado =
                    AsientoEstado.OUT_OF_SERVICE;
                }
                const capacidad = asientos.filter(
                  (asiento) =>
                    asiento.estado !==
                    AsientoEstado.OUT_OF_SERVICE,
                ).length;
                setValue("capacidad", capacidad, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                setValue("asientos", asientos, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                trigger();
              }
            }}
          />
          <AsientoSimbología />
        </Box>
      </PaperBlock>
      <SelectorServicios
        fullList={disponiblesQuery.data ?? []}
        openSidebar={openSidebar}
        existingServices={filteredUnselectedServices}
        selectedServices={watch("servicios")}
        updateList={(services) => {
          setValue("servicios", services, {
            shouldValidate: true,
            shouldDirty: true,
          });
          trigger("servicios");
        }}
        closeSidebar={closeSidebar}
      />
      <FormButtonsRow
        onSubmitClick={handleSubmit(doSubmit)}
        hasRequiredFields
        onResetClick={() => reset(template)}
        submitDisabled={!isDirty || !isValid}
        isLoading={res.isLoading}
        resetDisabled={!isDirty}
      />
    </>
  );
};
