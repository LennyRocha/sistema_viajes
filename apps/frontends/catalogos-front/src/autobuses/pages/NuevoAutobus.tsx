import React from "react";
import {
  PaperHeader,
  Breadcrumb,
  PaperBlock,
  FormButtonsRow,
  CommonPageProps,
  getYearsList,
  HandleResponseError,
} from "@nexoroute/commons";
import {
  Box,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import VehiculoPreview from "../components/VehiculoPreview";
import SelectorServicios from "../components/SelectorServicios";
import BusMap from "../components/BusMap";
import AsientoSimbología from "../components/AsientoSimbología";
import { useForm } from "react-hook-form";
import {
  autobusSchema,
  AutobusSchema,
} from "../validations/autobusZod";
import { autobusTemplate } from "../templates/autobusTemplate";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import onSubmit from "../forms/onNewAutobusSubmit";
import { useCreateAutobusMutation } from "../api/autobusApi";
import { useGetTiposAutobusQuery } from "../../tipos_autobus/api/tiposAutobusApi";
import { useGetInstitucionesQuery } from "../../instituciones/api/institucionesApi";
import Modelo3DName from "../../tipos_autobus/types/Modelo3DName";
import { useGetDisponibilidadMatchingQuery } from "../../disponibilidad-servicios/api/disponibilidadApi";
import {
  plantillaEstandar,
  plantillaPremium,
  plantillaShuttle,
} from "../constants/asientosPlantilla";
import { AsientoEstado } from "../types/AsientoEstado";

interface NuevoAutobusProps extends CommonPageProps {}

export default function NuevoAutobus({
  navigationFunction,
  openSidebar,
  closeSidebar = () => {},
  showDialog = () => {},
  snack,
  router,
  userPrivileges = [],
  pathname,
}: Readonly<NuevoAutobusProps>) {
  const {
    register,
    handleSubmit,
    reset,
    trigger,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<AutobusSchema>({
    resolver: zodResolver(autobusSchema),
    defaultValues: autobusTemplate,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [errores, setErrores] = React.useState<
    Record<string, string[]>
  >({});

  const [mutate, res] = useCreateAutobusMutation();
  const tiposQuery = useGetTiposAutobusQuery();
  const institucionesQuery = useGetInstitucionesQuery({
    active: true,
  });

  const doSubmit = async (data: AutobusSchema) => {
    return await onSubmit(data, {
      snack,
      navigationFunction,
      mutate,
      setErrores,
    });
  };

  const errs = res.error as any;

  const modelos: Record<number, Modelo3DName> = {
    1: "hyundai",
    2: "mercedes",
    3: "volkswagen",
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
    );
    const capacidad = watch("asientos").filter(
      (asiento) =>
        asiento.estado !== AsientoEstado.OUT_OF_SERVICE,
    ).length;
    setValue("capacidad", capacidad);
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

  const disponiblesQuery =
    useGetDisponibilidadMatchingQuery(params);

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
            nombre: "Nuevo",
            href: "/dashboard/buses/nuevo",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Nuevo autobús"
        subtitle="Agrega un nuevo autobús para que se pueda utilizar en los viajes"
        iconname="add"
        showButton
        onButtonClick={() =>
          navigationFunction("/dashboard/buses")
        }
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
                    pattern: "^[a-zA-Z0-9-]+$",
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
                onChange={(e) =>
                  setValue(
                    "institucion_id",
                    Number(e.target.value),
                  )
                }
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
              onChange={(e) =>
                setValue(
                  "tipo_autobus_id",
                  Number(e.target.value),
                )
              }
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
            label="Modelo *"
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
            label="Año *"
            variant="outlined"
            size="small"
            fullWidth
            defaultValue={"2026"}
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
        <Box sx={{ width: "fit-content", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", justifyContent: "center" }}>
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
                setValue("capacidad", capacidad);
                setValue("asientos", asientos);
                trigger("asientos");
                trigger("capacidad");
              }
            }}
          />
          <AsientoSimbología />
        </Box>
      </PaperBlock>
      <SelectorServicios openSidebar={openSidebar} />
      <FormButtonsRow
        onSubmitClick={handleSubmit(doSubmit)}
        hasRequiredFields
        onResetClick={() => reset(autobusTemplate)}
        submitDisabled={!isDirty || !isValid}
        isLoading={res.isLoading}
        resetDisabled={!isDirty}
      />
    </>
  );
}
