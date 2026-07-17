import {
  PaperHeader,
  Breadcrumb,
  Tabla,
  CommonPageProps,
  Simplify,
  EmptyState,
} from "@nexoroute/commons";
import React from "react";
import { Add, FilterList } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import buildServicesColumns from "../utils/buildServicesColumns";
import ServicioExterno from "../types/ServicioExterno";
import PropiedadesServicio from "../components/PropiedadesServicio";
import { useGetServiciosQuery } from "../api/serviciosApi";
import useServicesFilter from "../hooks/useServicesFilter";

interface Props extends CommonPageProps {}

export default function ServiciosIndex({
  navigationFunction,
  openSidebar,
  showDialog = () => {},
  snack,
  userPrivileges = [],
}: Readonly<Props>) {
  const dispatchSidebar = (servicio: ServicioExterno) =>
    openSidebar({
      title: servicio.nombre,
      children: <PropiedadesServicio servicio={servicio} />,
    });
  const columnas = buildServicesColumns(dispatchSidebar);
  const query = useGetServiciosQuery();

  const {
    list,
    query: serviceQuery,
    setQuery,
    options,
    option,
    setOption,
  } = useServicesFilter(query.data ?? []);
  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          {
            nombre: "Servicios",
            href: "/services",
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
          navigationFunction("/services/nuevo")
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
              navigationFunction("/services/nuevo"),
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
              `/services/${row.nombre}/editar`,
            )
          }
          onToggleActiveClick={() =>
            showDialog({
              title: "¿Cambiar estado del servicio?",
              content: (
                <>
                  Let Google help apps determine location.
                  This means sending anonymous location data
                  to Google, even when no apps are running.
                </>
              ),
              showCloseButton: true,
              showCancelButton: true,
              onConfirm: () =>
                snack?.success({
                  message: "Servicio desactivado",
                  duration: 3000,
                }),
              onClose: () => {},
            })
          }
          subHeaderComponent={
            <SubheaderComponent
              query={serviceQuery}
              setQuery={setQuery}
              options={options}
              setOption={setOption}
              option={option}
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
      <IconButton aria-label="Filtrar" size="small">
        <FilterList />
      </IconButton>
      <Button
        variant="outlined"
        size="small"
        color="secondary"
        onClick={() => {
          setQuery("");
          setOption("");
        }}
      >
        Limpiar filtros
      </Button>
    </Box>
  );
};

type ServicioRow = Simplify<ServicioExterno>;
