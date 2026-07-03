import {
  PaperHeader,
  Breadcrumb,
  Tabla,
  CommonPageProps,
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
  MenuItem,
  TextField,
} from "@mui/material";
import { servicios as data } from "../../data/constants";
import buildServicesColumns from "../utils/buildServicesColumns";

interface Props extends CommonPageProps {}

export default function ServiciosIndex({
  navigationFunction,
}: Readonly<Props>) {
  const columnas = buildServicesColumns();
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
      />
      <Tabla
        titulo="Servicios"
        subtitulo="Listado de servicios ofrecidos en los distintos viajes"
        columnas={columnas}
        data={data}
        onEditClick={console.log}
        onToggleActiveClick={console.log}
        subHeaderComponent={
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
            />
            <TextField
              label="Disponibilidad"
              variant="outlined"
              size="small"
              sx={{ flex: 1, minWidth: 200 }}
              select
            >
              <MenuItem value={"predeterminada"}>
                Predeterminada
              </MenuItem>
              <MenuItem value={"personalizada"}>
                Personalizada
              </MenuItem>
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
      {/* <EmptyState
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
      /> */}
    </>
  );
}
