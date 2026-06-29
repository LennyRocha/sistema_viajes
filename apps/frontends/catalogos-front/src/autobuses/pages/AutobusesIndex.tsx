"use client";
import {
  PaperHeader,
  Breadcrumb,
  Tabla,
  type SidebarConfig
} from "@nexoroute/commons";
import React from "react";
import {
  Add,
  FilterList,
  Settings,
} from "@mui/icons-material";
import { GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Button,
  IconButton,
  TextField,
} from "@mui/material";

interface Props {
  onHeaderButtonClick: () => void;
  openSidebar: (config: SidebarConfig) => void;
}

export default function AutobusesIndex({
  onHeaderButtonClick,
  openSidebar,
}: Readonly<Props>) {
  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[{ nombre: "Autobuses", href: "/buses" }]}
      />
      <PaperHeader
        title="Autobuses"
        subtitle="Listado de autobuses disponibles"
        iconname="room_service"
        showButton
        onButtonClick={onHeaderButtonClick}
        buttonTitle="Nuevo"
        leftIcon={<Add />}
      />
      <Tabla
        titulo="Autobuses"
        subtitulo="Listado de autobuses disponibles"
        columnas={columns}
        data={rows}
        onEditClick={console.log}
        onDeleteClick={console.log}
        onToggleActiveClick={console.log}
        onInfoClick={() =>
          openSidebar({
            title: "Detalles del autobús",
            children: (
              <div>
                Sidebar Content{" "}
              </div>
            ),
          })
        }
        subHeaderComponent={
          <Box
            sx={{
              display: "flex",
              gap: 2,
            }}
          >
            <TextField
              label="Buscar autobús"
              variant="outlined"
              size="small"
              sx={{ flex: 1, minWidth: 200 }}
            />
            <TextField
              label="Filtrar por categoría"
              variant="outlined"
              size="small"
              sx={{ flex: 1, minWidth: 200 }}
            />
            <IconButton aria-label="Filtrar" size="small">
              <FilterList />
            </IconButton>
            <Button
              variant="contained"
              size="small"
              color="secondary"
            >
              Aplicar filtros
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="inherit"
            >
              Limpiar filtros
            </Button>
            <IconButton aria-label="Ajustes" size="small">
              <Settings />
            </IconButton>
          </Box>
        }
      />
    </>
  );
}

type Persona = {
  id: number;
  firstName: string;
  lastName: string;
  age: number | null;
  estatus: boolean;
};

const columns: GridColDef<Persona>[] = [
  {
    field: "id",
    headerName: "ID",
    width: 70,
  },
  {
    field: "firstName",
    headerName: "Nombre",
    width: 130,
  },
  {
    field: "lastName",
    headerName: "Apellido",
    width: 130,
  },
  {
    field: "age",
    headerName: "Edad",
    type: "number",
    width: 90,
  },
  {
    field: "fullName",
    headerName: "Nombre completo",
    sortable: false,
    width: 180,
    valueGetter: (_, row) =>
      `${row.firstName ?? ""} ${row.lastName ?? ""}`,
  },
];

const rows: Persona[] = [
  {
    id: 1,
    firstName: "Jon",
    lastName: "Snow",
    age: 35,
    estatus: true,
  },
  {
    id: 2,
    firstName: "Cersei",
    lastName: "Lannister",
    age: 42,
    estatus: false,
  },
];
