import React from "react";
import { GridColDef } from "@mui/x-data-grid";
import { Button, Chip } from "@mui/material";
import ServicioExterno from "../types/ServicioExterno";
import { DynamicIcon } from "@nexoroute/commons";

const buildServicesColumns = () => {
  const columnas: GridColDef<ServicioExterno>[] = [
    {
      field: "icono_nombre",
      headerName: "Icono representativo",
      width: 175,
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <DynamicIcon name={params.row.icono_nombre} />
      ),
    },
    {
      field: "nombre",
      headerName: "Nombre del servicio",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "propiedades",
      headerName: "Propiedades",
      width: 250,
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      renderCell: (params) => (
        <Button variant="text" size="small">
          {params.row.propiedades.length} Propiedades
        </Button>
      ),
    },
    {
      field: "disponibilidad",
      headerName: "Disponibilidad",
      width: 140,
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      renderCell: (params) => (
        <Chip
          label={
            params.row.disponibilidad
              ? "Predeterminada"
              : "Personalizada"
          }
          color={
            params.row.disponibilidad ? "success" : "info"
          }
          variant="outlined"
        />
      ),
    },
  ];

  return columnas;
};

export default buildServicesColumns;
