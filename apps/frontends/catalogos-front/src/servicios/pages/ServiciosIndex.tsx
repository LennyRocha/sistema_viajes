import {
  PaperHeader,
  Breadcrumb,
  Tabla,
  CommonPageProps,
  Simplify,
  EmptyState,
  HandleResponseError,
} from "@nexoroute/commons";
import React from "react";
import {
  Add,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Box,
  Button,
  DialogContentText,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import buildServicesColumns from "../utils/buildServicesColumns";
import ServicioExterno from "../types/ServicioExterno";
import PropiedadesServicio from "../components/PropiedadesServicio";
import {
  useChangeStatusServicioMutation,
  useGetServiciosQuery,
} from "../api/serviciosApi";
import useServicesFilter from "../hooks/useServicesFilter";
import onChangeStatus from "../forms/onChangeStatusSubmit";

interface Props extends CommonPageProps {}

export default function ServiciosIndex({
  navigationFunction,
  openSidebar,
  showDialog = () => {},
  snack,
  pathname,
  router,
  userPrivileges = [],
}: Readonly<Props>) {
  const dispatchSidebar = (servicio: ServicioExterno) =>
    openSidebar({
      title: `Propiedades de: ${servicio.nombre}`,
      children: <PropiedadesServicio servicio={servicio} />,
    });
  const [active, setActive] =
    React.useState<boolean>(false);
  const columnas = buildServicesColumns(dispatchSidebar);
  const query = useGetServiciosQuery({
    active: active,
  });

  const [dispatch, { isLoading }] =
    useChangeStatusServicioMutation();

  const {
    list,
    query: serviceQuery,
    setQuery,
    options,
    option,
    setOption,
  } = useServicesFilter(query.data ?? []);

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
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          {
            nombre: "Servicios",
            href: "/dashboard/services",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Servicios"
        subtitle="Listado de servicios ofrecidos en los distintos viajes"
        iconname="room_service"
        showButton
        onButtonClick={() =>
          navigationFunction("/dashboard/services/nuevo")
        }
        buttonTitle="Nuevo"
        leftIcon={<Add />}
        isLoading={query.isLoading || query.isFetching}
      />
      {query.data?.length === 0 ? (
        <EmptyState
          variant="no-data"
          title="No hay servicios disponibles"
          description="Actualmente no hay servicios disponibles para mostrar. Por favor, agregue un nuevo servicio para continuar."
          action={{
            label: "Agregar servicio",
            onClick: () =>
              navigationFunction(
                "/dashboard/services/nuevo",
              ),
          }}
          imageSize={{
            width: 200,
            height: 200,
          }}
        />
      ) : (
        <Tabla<ServicioRow>
          titulo="Servicios"
          subtitulo="Listado de servicios ofrecidos en los distintos viajes"
          columnas={columnas}
          data={list}
          isLoading={query.isLoading || query.isFetching}
          onEditClick={(row) =>
            navigationFunction(
              `/dashboard/services/${row.slug}/editar`,
            )
          }
          onToggleActiveClick={(row) =>
            showDialog({
              title: "¿Cambiar estado del servicio?",
              content: (
                <DialogContentText>
                  ¿Desea cambiar el estado del servicio "
                  {row.nombre}" de{" "}
                  {row.estatus ? "activo" : "inactivo"} a{" "}
                  {row.estatus ? "inactivo" : "activo"}?
                </DialogContentText>
              ),
              showCloseButton: true,
              showCancelButton: true,
              onConfirm: () =>
                onChangeStatus(row.id ?? -1, {
                  snack,
                  mutate: dispatch,
                }),
              onClose: () => {},
              isLoading: isLoading,
              submitOnEnter: true,
            })
          }
          subHeaderComponent={
            <SubheaderComponent
              query={serviceQuery}
              setQuery={setQuery}
              options={options}
              setOption={setOption}
              option={option}
              active={active}
              setActive={setActive}
            />
          }
        />
      )}
    </>
  );
}

const SubheaderComponent = ({
  query,
  setQuery,
  options = {},
  setOption,
  option,
  active,
  setActive,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
      }}
    >
      <TextField
        label="Buscar servicio"
        variant="outlined"
        size="small"
        sx={{ flex: 1, minWidth: 200 }}
        value={query}
        onChange={(e) => setQuery(e.target.value.trim())}
      />
      <TextField
        label="Disponibilidad"
        variant="outlined"
        size="small"
        sx={{ flex: 1, minWidth: 200 }}
        select
        value={option}
      >
        {Object.entries(options).map(([key, value]) => (
          <MenuItem
            key={key}
            value={key}
            onClick={() =>
              setOption(key as keyof typeof options)
            }
          >
            {`${value}`}
          </MenuItem>
        ))}
      </TextField>
      <Tooltip
        title={
          active ? "Mostrar todos" : "Mostrar solo activos"
        }
      >
        <IconButton
          aria-label="Filtrar"
          size="medium"
          onClick={() => setActive((prev) => !prev)}
        >
          {active ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </Tooltip>
      <Button
        variant="outlined"
        size="small"
        color="secondary"
        onClick={() => {
          setQuery("");
          setOption("");
          setActive(false);
        }}
      >
        Limpiar filtros
      </Button>
    </Box>
  );
};

type ServicioRow = Simplify<ServicioExterno>;
