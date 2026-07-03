"use client";
import {
  PaperHeader,
  Breadcrumb,
  Tabla,
  CommonPageProps,
} from "@nexoroute/commons";
import React from "react";
import { Add, FilterList } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  TextField,
  MenuItem,
} from "@mui/material";
import { conductores as data } from "../../data/constants";
import buildConductoresColumns from "../utils/buildConductoresColumns";
import ConductorDetails from "../components/ConductorDetails";

export default function ConductoresIndex({
  navigationFunction,
  openSidebar,
  showDialog,
  snack,
  userPrivileges = [],
}: Readonly<CommonPageProps>) {
  const columnas = buildConductoresColumns();

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          {
            nombre: "Conductores",
            href: "/conductores",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Conductores"
        subtitle="Listado de conductores disponibles"
        iconname="person"
        showButton
        onButtonClick={() => navigationFunction("/conductores/nuevo")}
        buttonTitle="Nuevo"
        leftIcon={<Add />}
      />
      <Tabla
        titulo="Conductores"
        subtitulo="Listado de conductores disponibles"
        columnas={columnas}
        data={data}
        onEditClick={(row) =>
          navigationFunction(`/conductores/editar/${row.cedula}`)
        }
        onInfoClick={(row) =>
          openSidebar({
            title: "Detalles del Conductor",
            children: <ConductorDetails row={row} />,
          })
        }
        onToggleActiveClick={console.log}
        subHeaderComponent={
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Buscar por cédula"
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
    </>
  );
}