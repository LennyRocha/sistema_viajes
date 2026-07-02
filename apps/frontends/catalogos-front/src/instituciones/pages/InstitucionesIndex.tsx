"use client";

import {
  Breadcrumb,
  CommonPageProps,
  PaperHeader,
  Tabla,
} from "@nexoroute/commons";
import React from "react";
import { Add, FilterList } from "@mui/icons-material";
import {
  Box,
  Button,
  DialogContentText,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import { instituciones as data } from "../../data/constants";
import InstitucionDetails from "../components/InstitucionDetails";
import Institucion from "../types/Institucion";
import buildInstitucionesColumns from "../utils/buildInstitucionesColumns";

interface Props extends CommonPageProps {}

export default function InstitucionesIndex({
  navigationFunction,
  openSidebar,
  showDialog = () => {},
  snack,
}: Readonly<Props>) {
  const columnas = buildInstitucionesColumns();
  const [instituciones, setInstituciones] = React.useState<
    Institucion[]
  >(data);

  const toggleInstitucion = (row: Institucion) => {
    setInstituciones((current) =>
      current.map((institucion) =>
        institucion.id === row.id
          ? {
              ...institucion,
              estatus: !institucion.estatus,
            }
          : institucion,
      ),
    );
  };

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          {
            nombre: "Instituciones",
            href: "/institutions",
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
          navigationFunction("/institutions/nuevo")
        }
        buttonTitle="Nuevo"
        leftIcon={<Add />}
      />
      <Tabla
        titulo="Instituciones"
        subtitulo="Listado de instituciones registradas"
        columnas={columnas as any}
        data={instituciones}
        onEditClick={(row) =>
          navigationFunction(`/institutions/editar/${row.id}`)
        }
        onToggleActiveClick={(row) =>
          showDialog({
            title: row.estatus
              ? "Desactivar institucion"
              : "Activar institucion",
            content: (
              <DialogContentText>
                Confirma el cambio de estado para la
                institucion {row.nombre}.
              </DialogContentText>
            ),
            showCloseButton: true,
            showCancelButton: true,
            onConfirm: () => {
              toggleInstitucion(row);
              snack?.success({
                message: row.estatus
                  ? "Institucion desactivada"
                  : "Institucion activada",
              });
            },
          })
        }
        onInfoClick={(row) =>
          openSidebar({
            title: "Detalles de la institucion",
            children: <InstitucionDetails row={row} />,
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
              label="Buscar institucion"
              variant="outlined"
              size="small"
              sx={{ flex: 1, minWidth: 220 }}
            />
            <TextField
              select
              label="Estado"
              size="small"
              defaultValue="todos"
              sx={{ width: 180 }}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="activa">Activas</MenuItem>
              <MenuItem value="inactiva">Inactivas</MenuItem>
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
