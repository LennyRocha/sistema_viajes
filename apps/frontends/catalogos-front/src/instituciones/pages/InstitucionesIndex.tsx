"use client";

import {
  Breadcrumb,
  CommonPageProps,
  EmptyState,
  HandleResponseError,
  PaperHeader,
  Tabla,
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
  TextField,
  Tooltip,
} from "@mui/material";
import InstitucionDetails from "../components/InstitucionDetails";
import buildInstitucionesColumns from "../utils/buildInstitucionesColumns";
import {
  useChangeStatusInstitucionMutation,
  useGetInstitucionesQuery,
} from "../api/institucionesApi";
import onChangeStatus from "../forms/onChangeStatusSubmit";
import useInstitutionsFilter from "../hooks/useInstitutionsFilter";

interface Props extends CommonPageProps {}

export default function InstitucionesIndex({
  navigationFunction,
  openSidebar,
  showDialog = () => {},
  snack,
  pathname,
  router,
  userPrivileges = [],
  userRoles = [],
}: Readonly<Props>) {
  const columnas = buildInstitucionesColumns();
  const [active, setActive] =
    React.useState<boolean>(false);
  const query = useGetInstitucionesQuery({
    active: active,
  });
  const [dispatch, { isLoading }] =
    useChangeStatusInstitucionMutation();

  const {
    name,
    setName,
    description,
    setDescription,
    clearFilters,
    list,
  } = useInstitutionsFilter(query.data ?? []);

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
            nombre: "Instituciones",
            href: "/dashboard/institutions",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Instituciones"
        subtitle="Listado de instituciones registradas"
        iconname="account_balance"
        showButton
        onButtonClick={() =>
          navigationFunction(
            "/dashboard/institutions/nuevo",
          )
        }
        buttonTitle="Nuevo"
        leftIcon={<Add />}
        isLoading={query.isLoading}
      />
      {query.data?.length === 0 ? (
        <EmptyState
          variant="no-data"
          title="No hay instituciones disponibles"
          description="Actualmente no hay instituciones disponibles para mostrar. Por favor, agregue una nueva institucion para continuar."
          action={{
            label: "Agregar institucion",
            onClick: () =>
              navigationFunction(
                "/dashboard/institutions/nuevo",
              ),
          }}
          imageSize={{
            width: 200,
            height: 200,
          }}
        />
      ) : (
        <Tabla
          titulo="Instituciones"
          subtitulo="Listado de instituciones registradas"
          columnas={columnas as any}
          data={list}
          isLoading={query.isLoading || query.isFetching}
          onEditClick={(row) =>
            navigationFunction(
              `/dashboard/institutions/editar/${row.slug}`,
            )
          }
          onToggleActiveClick={(row) =>
            showDialog({
              title: "¿Cambiar estado de la institucion?",
              content: (
                <DialogContentText>
                  ¿Desea cambiar el estado de la institucion
                  "{row.nombre}" de{" "}
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
          onInfoClick={(row) =>
            openSidebar({
              title: "Detalles de la institucion",
              children: <InstitucionDetails row={row} />,
            })
          }
          subHeaderComponent={
            <SubheaderComponent
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              clearFilters={clearFilters}
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
  name,
  setName,
  description,
  setDescription,
  clearFilters,
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
        label="Buscar institucion por nombre"
        variant="outlined"
        size="small"
        sx={{ flex: 1, minWidth: 200 }}
        value={name}
        onChange={(e) => setName(e.target.value.trim())}
      />
      <TextField
        label="Buscar institucion por descripción"
        variant="outlined"
        size="small"
        sx={{ flex: 1, minWidth: 200 }}
        value={description}
        onChange={(e) =>
          setDescription(e.target.value.trim())
        }
      />
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
          clearFilters();
          setActive(false);
        }}
      >
        Limpiar filtros
      </Button>
    </Box>
  );
};
