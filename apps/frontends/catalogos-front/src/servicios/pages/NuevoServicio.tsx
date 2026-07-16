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
} from "@nexoroute/commons";
import {
  Box,
  Button,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { Add, ChevronLeft } from "@mui/icons-material";
import CustomIconPicker from "../components/CustomIconPicker";
import { servicioTemplate } from "../utils/servicioTemplate";
import { useForm } from "react-hook-form";
import onSubmit from "../forms/onNewServicioSubmit";
import PropiedadServicioContent from "../components/PropiedadServicioContent";
import buildServiceProperyColumns from "../utils/buildServiceProperyColumns";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  servicioSchema,
  ServicioSchema,
} from "../validations/servicioZod";
import {
  CampoConfigSchema,
  campoConfigSchema,
} from "../validations/campoZod";

interface NuevoServicioProps extends CommonPageProps {}

export default function NuevoServicio({
  navigationFunction,
  openSidebar,
  closeSidebar = () => {},
  showDialog = () => {},
  snack,
  userPrivileges = [],
}: Readonly<NuevoServicioProps>) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    trigger,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<ServicioSchema>({
    resolver: zodResolver(servicioSchema),
    defaultValues: servicioTemplate,
  });

  const doSubmit = async (data: ServicioSchema) => {
    return await onSubmit(data, {
      snack,
      navigationFunction,
    });
  };

  const icon_name =
    getValues("icono_nombre") ?? "room-service";
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

  const propiedades = watch("propiedades") ?? [
    campoConfigSchema.parse({}),
  ];
  const columnas = buildServiceProperyColumns();
  const rows = propiedades.map((propiedad, index) => ({
    ...propiedad,
    id: propiedad.clave || index,
  }));
  return (
    <>
      {" "}
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          { nombre: "Servicios", href: "/services" },
          {
            nombre: "Nuevo",
            href: "/services/nuevo",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Nuevo servicio"
        subtitle="Agrega un nuevo servicio para que se pueda utilizar en los viajes"
        iconname="add"
        showButton
        onButtonClick={() =>
          navigationFunction("/services")
        }
        buttonTitle="Volver"
        leftIcon={<ChevronLeft />}
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
          label="Nombre del servicio *"
          variant="outlined"
          size="small"
          {...register("nombre", {
            required: "El nombre del servicio es requerido",
          })}
          error={!!errors.nombre}
          fullWidth
        />
        <TextField
          label="Descripción *"
          variant="outlined"
          size="small"
          {...register("descripcion", {
            required:
              "La descripción del servicio es requerida",
          })}
          error={!!errors.descripcion}
          fullWidth
          multiline
          rows={4}
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
            name={
              getValues("icono_nombre") ?? "room-service"
            }
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
            {getValues("icono_nombre") ?? "room-service"}
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenIconPicker}
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
            {propiedades?.length ?? 0} propiedades definidas
          </Typography>
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() =>
              openSidebar({
                title: "Nueva propiedad de servicio",
                children: (
                  <PropiedadServicioContent
                    propiedades={propiedades}
                    setValue={setValue}
                    closeSidebar={closeSidebar}
                    readonly={false}
                  />
                ),
              })
            }
            disabled={(propiedades?.length ?? 0) >= 12}
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
            isLoading={false}
            onEditClick={(row) =>
              openSidebar({
                title: "Editar propiedad de servicio",
                children: (
                  <PropiedadServicioContent
                    propiedades={propiedades}
                    setValue={setValue}
                    closeSidebar={closeSidebar}
                    readonly={false}
                    propiedad={row}
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
      </PaperBlock>
      <FormButtonsRow
        onSubmitClick={handleSubmit(doSubmit)}
        hasRequiredFields
        onResetClick={() => reset(servicioTemplate)}
        submitDisabled={!isDirty || !isValid}
      />
    </>
  );
}

export type PropiedadRow = Simplify<CampoConfigSchema>;
