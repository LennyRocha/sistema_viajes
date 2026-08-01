"use client";
import {
  PaperHeader,
  Breadcrumb,
  Tabla,
  CommonPageProps,
} from "@nexoroute/commons";
import React, { useMemo, useState } from "react";
import { Add, FilterList } from "@mui/icons-material";
import { Alert, Box, IconButton, TextField } from "@mui/material";
import buildConductoresColumns from "../utils/buildConductoresColumns";
import ConductorDetails from "../components/ConductorDetails";
import {
  useGetConductoresQuery,
  useChangeStatusConductorMutation,
} from "../api/conductorApi";

export default function ConductoresIndex({
  navigationFunction,
  openSidebar,
  showDialog,
  snack,
  userPrivileges = [],
}: Readonly<CommonPageProps>) {
  const columnas = buildConductoresColumns();
  const [searchCurp, setSearchCurp] = useState("");
  const [searchNombre, setSearchNombre] = useState("");

  const {
    data: conductores,
    isLoading,
    isFetching,
    isError,
  } = useGetConductoresQuery();

  const [changeStatus] = useChangeStatusConductorMutation();

  const filteredConductores = useMemo(() => {
    const curpFilter = searchCurp.trim().toLowerCase();
    const nombreFilter = searchNombre.trim().toLowerCase();
    const source = conductores ?? [];

    if (!curpFilter && !nombreFilter) {
      return source;
    }

    return source.filter((conductor) => {
      const nombreCompleto = `${conductor.nombres ?? ""} ${
        conductor.apellido_paterno ?? ""
      } ${conductor.apellido_materno ?? ""}`.toLowerCase();

      const matchesCurp =
        !curpFilter ||
        (conductor.curp ?? "").toLowerCase().includes(curpFilter);

      const matchesNombre =
        !nombreFilter || nombreCompleto.includes(nombreFilter);

      return matchesCurp && matchesNombre;
    });
  }, [conductores, searchCurp, searchNombre]);

  const hasActiveFilters = Boolean(searchCurp.trim() || searchNombre.trim());

  const handleToggleActive = async (row: { id: number }) => {
    try {
      await changeStatus({ id: row.id }).unwrap();
      snack?.("Estado actualizado correctamente", "success");
    } catch (error) {
      console.error(error);
      snack?.("No se pudo cambiar el estado del conductor", "error");
    }
  };

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          {
            nombre: "Conductores",
            href: "/dashboard/conductores",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Conductores"
        subtitle="Listado de conductores disponibles"
        iconname="person"
        showButton
        onButtonClick={() => navigationFunction("/dashboard/conductores/nuevo")}
        buttonTitle="Nuevo"
        leftIcon={<Add />}
      />
      <Tabla
        titulo="Conductores"
        subtitulo="Listado de conductores disponibles"
        columnas={columnas}
        data={filteredConductores}
        loading={isLoading || isFetching}
        onEditClick={(row) =>
          navigationFunction(`/dashboard/conductores/editar/${row.id}`)
        }
        onInfoClick={(row) =>
          openSidebar({
            title: "Detalles del Conductor",
            children: <ConductorDetails row={row} />,
          })
        }
        onToggleActiveClick={handleToggleActive}
        subHeaderComponent={
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Buscar por CURP"
              variant="outlined"
              size="small"
              value={searchCurp}
              onChange={(event) => setSearchCurp(event.target.value)}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <TextField
              label="Buscar por nombre"
              variant="outlined"
              size="small"
              value={searchNombre}
              onChange={(event) => setSearchNombre(event.target.value)}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <IconButton aria-label="Filtrar" size="small">
              <FilterList />
            </IconButton>
          </Box>
        }
      />
      {isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Ocurrió un error al cargar los conductores. Intenta recargar la página.
        </Alert>
      )}
      {!isLoading && !isFetching && !isError && hasActiveFilters && filteredConductores.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No se encontraron conductores con los filtros aplicados.
        </Alert>
      )}
      {!isLoading && !isFetching && !isError && !hasActiveFilters && (conductores ?? []).length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Aún no hay conductores registrados en el sistema.
        </Alert>
      )}
    </>
  );
}