"use client";
import {
  PaperHeader,
  Breadcrumb,
  Tabla,
  CommonPageProps,
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
  IconButton,
  TextField,
  MenuItem,
  DialogContentText,
  Tooltip,
} from "@mui/material";
import { BusTablaType } from "../types/BusTablaType";
import buildAutobusesColumns from "../utils/buildBusesColumns";

import BusDetails from "../components/BusDetails";
import {
  useChangeStatusAutobusMutation,
  useGetAutobusesQuery,
} from "../api/autobusApi";
import { useGetTiposAutobusQuery } from "../../tipos_autobus/api/tiposAutobusApi";
import { useGetInstitucionesQuery } from "../../instituciones/api/institucionesApi";
import useBusesFilter from "../hooks/useAutobusFilter";
import onChangeStatus from "../forms/onChangeStatusSubmit";

interface Props extends CommonPageProps {}

export default function AutobusesIndexPage({
  navigationFunction,
  openSidebar,
  showDialog = () => {},
  snack,
  router,
  pathname,
  userPrivileges = [],
}: Readonly<Props>) {
  const [active, setActive] =
    React.useState<boolean>(false);

  const columnas = buildAutobusesColumns();

  const [tipoBus, setTipoBus] = React.useState<number>(0);
  const [institucion, setInstitucion] =
    React.useState<number>(0);

  const query = useGetAutobusesQuery({
    active: active,
    tipo_bus: tipoBus,
    institucion: institucion,
  });
  const tiposQuery = useGetTiposAutobusQuery();
  const institucionesQuery = useGetInstitucionesQuery({
    active: true,
  });
  const [dispatch, { isLoading }] =
    useChangeStatusAutobusMutation();

  const {
    alias,
    setAlias,
    codigo,
    setCodigo,
    list,
    clearFilters,
  } = useBusesFilter(
    query.data ?? [],
    setTipoBus,
    setInstitucion,
    tipoBus,
    institucion,
  );
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
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          {
            nombre: "Autobuses",
            href: "/dashboard/buses",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Autobuses"
        subtitle="Listado de autobuses disponibles"
        iconname="directions_bus"
        showButton
        onButtonClick={() =>
          navigationFunction("/dashboard/buses/nuevo")
        }
        buttonTitle="Nuevo"
        leftIcon={<Add />}
      />
      <Tabla<BusTablaType>
        titulo="Autobuses"
        subtitulo="Listado de autobuses disponibles"
        columnas={columnas}
        data={list ?? []}
        isLoading={
          query.isLoading ||
          query.isFetching ||
          tiposQuery.isLoading ||
          institucionesQuery.isLoading
        }
        onEditClick={(row) =>
          navigationFunction(
            `/buses/editar/${row.codigo_interno}`,
          )
        }
        onToggleActiveClick={(row) =>
          showDialog({
            title: "¿Cambiar estado del autobús?",
            content: (
              <DialogContentText>
                ¿Desea cambiar el estado del autobús
                {row.codigo_interno}, alias "{row.alias}" de{" "}
                {row.estatus ? "activo" : "inactivo"} a{" "}
                {row.estatus ? "inactivo" : "activo"}?
              </DialogContentText>
            ),
            showCloseButton: true,
            showCancelButton: true,
            onConfirm: () => {
              onChangeStatus(row.id ?? -1, {
                snack,
                mutate: dispatch,
              });
              query.refetch();
            },
            onClose: () => {},
            isLoading: isLoading,
            submitOnEnter: true,
          })
        }
        onInfoClick={(row) =>
          openSidebar({
            title: "Detalles del autobús",
            children: <BusDetails row={row} />,
          })
        }
        subHeaderComponent={
          <SubHeaderComponent
            alias={alias}
            setAlias={setAlias}
            codigo={codigo}
            setCodigo={setCodigo}
            clearFilters={clearFilters}
            tiposQuery={tiposQuery}
            institucionesQuery={institucionesQuery}
            tipoBus={tipoBus}
            setTipoBus={setTipoBus}
            institucion={institucion}
            setInstitucion={setInstitucion}
            active={active}
            setActive={setActive}
          />
        }
      />
    </>
  );
}

const SubHeaderComponent = ({
  alias,
  setAlias,
  codigo,
  setCodigo,
  clearFilters,
  tiposQuery,
  institucionesQuery,
  tipoBus,
  setTipoBus,
  institucion,
  setInstitucion,
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
        label="Buscar por código interno"
        variant="outlined"
        size="small"
        sx={{ flex: 1, minWidth: 150 }}
        value={codigo}
        onChange={(e) => setCodigo(e.target.value.trim())}
      />
      <TextField
        label="Buscar por alias"
        variant="outlined"
        size="small"
        sx={{ flex: 1, minWidth: 150 }}
        value={alias}
        onChange={(e) => setAlias(e.target.value.trim())}
      />
      <TextField
        select
        label="Tipo de autobús"
        size="small"
        sx={{ flex: 1, minWidth: 150 }}
        value={tipoBus === 0 ? "" : tipoBus}
        onChange={(e) => setTipoBus(Number(e.target.value))}
      >
        {tiposQuery.data?.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.nombre}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Institución"
        size="small"
        sx={{ flex: 1, minWidth: 150 }}
        value={institucion === 0 ? "" : institucion}
        onChange={(e) =>
          setInstitucion(Number(e.target.value))
        }
      >
        {institucionesQuery.data?.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.nombre}
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
          size="small"
          onClick={() => setActive((prev) => !prev)}
        >
          {active ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </Tooltip>
      <Button
        variant="outlined"
        size="small"
        color="secondary"
        onClick={() => clearFilters()}
      >
        Limpiar filtros
      </Button>
    </Box>
  );
};
