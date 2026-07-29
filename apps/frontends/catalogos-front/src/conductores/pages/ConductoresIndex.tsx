"use client";
import {
  PaperHeader,
  Breadcrumb,
  Tabla,
  CommonPageProps,
} from "@nexoroute/commons";
import React from "react";
import { Add, FilterList } from "@mui/icons-material";
import { Box, IconButton, TextField } from "@mui/material";
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

  const {
    data: conductores,
    isLoading,
    isFetching,
    isError,
  } = useGetConductoresQuery();

  const [changeStatus] = useChangeStatusConductorMutation();

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
        data={conductores ?? []}
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
              sx={{ flex: 1, minWidth: 200 }}
            />
            <TextField
              label="Buscar por nombre"
              variant="outlined"
              size="small"
              sx={{ flex: 1, minWidth: 200 }}
            />
            <IconButton aria-label="Filtrar" size="small">
              <FilterList />
            </IconButton>
          </Box>
        }
      />
      {isError && (
        <Box sx={{ p: 2, color: "error.main" }}>
          Ocurrió un error al cargar los conductores.
        </Box>
      )}
    </>
  );
}