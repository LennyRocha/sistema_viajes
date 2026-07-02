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
  DialogContentText,
} from "@mui/material";
import {
  autobuses as data,
  tiposAutobus,
  instituciones,
} from "../../data/constants";
import buildAutobusesColumns from "../utils/buildBusesColumns";

import BusDetails from "../components/BusDetails";

interface Props extends CommonPageProps {}

export default function AutobusesIndex({
  navigationFunction,
  openSidebar,
  showDialog = () => {},
  snack,
  userPrivileges = [],
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
        breads={[
          {
            nombre: "Autobuses",
            href: "/buses",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Autobuses"
        subtitle="Listado de autobuses disponibles"
        iconname="room_service"
        showButton
        onButtonClick={() =>
          navigationFunction("/buses/nuevo")
        }
        buttonTitle="Nuevo"
        leftIcon={<Add />}
      />
      <Tabla
        titulo="Autobuses"
        subtitulo="Listado de autobuses disponibles"
        columnas={columnas}
        data={data}
        onEditClick={(row) =>
          navigationFunction(
            `/buses/editar/${row.codigo_interno}`,
          )
        }
        onToggleActiveClick={() =>
          showDialog({
            title: "¿Cambiar estado del autobús?",
            content: (
              <DialogContentText>
                {" "}
                Let Google help apps determine location.
                This means sending anonymous location data
                to Google, even when no apps are running.
              </DialogContentText>
            ),
            showCloseButton: true,
            showCancelButton: true,
            onConfirm: () =>
              snack?.success({
                message: "Autobus desactivado",
              }),
            onClose: () => console.log("Dialog closed"),
          })
        }
        onInfoClick={(row) =>
          openSidebar({
            title: "Detalles del autobús",
            children: <BusDetails row={row} />,
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
