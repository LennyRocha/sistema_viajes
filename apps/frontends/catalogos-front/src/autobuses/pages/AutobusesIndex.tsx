"use client";
import {
  PaperHeader,
  Breadcrumb,
  Tabla,
  type SidebarConfig,
} from "@nexoroute/commons";
import React from "react";
import {
  Add,
  FilterList,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  TextField,
  MenuItem,
} from "@mui/material";
import dynamic from "next/dynamic";
import {
  autobuses as data,
  tiposAutobus,
  instituciones,
} from "../../data/constants";
import buildAutobusesColumns from "../utils/buildBusesColumns";

const Vehiculo3D = dynamic(
  () =>
    import("../../federation").then(
      (mod) => mod.Vehiculo3D,
    ),
  {
    ssr: false,
    loading: () => <div>Cargando modelo 3D...</div>, // o un skeleton
  },
);

interface Props {
  onHeaderButtonClick: () => void;
  openSidebar: (config: SidebarConfig) => void;
}

export default function AutobusesIndex({
  onHeaderButtonClick,
  openSidebar,
}: Readonly<Props>) {
  React.useEffect(() => {
    console.log("NuevoAutobus mounted");

    return () => {
      console.log("NuevoAutobus unmounted");
    };
  }, []);
  const columnas = buildAutobusesColumns();
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
        columnas={columnas}
        data={data}
        onEditClick={() =>
          openSidebar({
            title: "Modificar autobús",
            children: <div>Hola</div>,
          })
        }
        onToggleActiveClick={console.log}
        onInfoClick={() =>
          openSidebar({
            title: "Detalles del autobús",
            children: (
              <div>
                <Vehiculo3D tipo="hyundai" />
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
              label="Buscar por código interno"
              variant="outlined"
              size="small"
              sx={{ flex: 1, minWidth: 200 }}
            />
            <TextField
              select
              label="Tipo de autobús"
              size="small"
              sx={{ flex: 1, minWidth: 200 }}
              onChange={(e) => console.log(e.target.value)}
            >
              {tiposAutobus.map((option) => (
                <MenuItem
                  key={option.id}
                  value={option.nombre}
                >
                  {option.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Institución"
              size="small"
              sx={{ flex: 1, minWidth: 200 }}
              onChange={(e) => console.log(e.target.value)}
            >
              {instituciones.map((option) => (
                <MenuItem
                  key={option.id}
                  value={option.nombre}
                >
                  {option.nombre}
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
            >
              Limpiar filtros
            </Button>
          </Box>
        }
      />
    </>
  );
}
