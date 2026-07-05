import React from "react";
import { GridColDef } from "@mui/x-data-grid";
import { Button, Chip, Link, Tooltip } from "@mui/material";
import ServicioExterno from "../types/ServicioExterno";
import { ServicioIcon } from "@nexoroute/commons";

const buildServicesColumns = (
  funct: (servicio: ServicioExterno) => void,
) => {
  const columnas: GridColDef<ServicioExterno>[] = [
    {
      field: "icono_nombre",
      headerName: "Icono representativo",
      width: 175,
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <ServicioIcon name={params.row.icono_nombre} />
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
      width: 200,
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      renderCell: (params) => (
        <Button
          variant="text"
          size="small"
          onClick={() => funct(params.row)}
        >
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
        <Tooltip
          title={
            params.row.disponibilidad
              ? "Este servicio está disponible para todos los tipos de autobús en todas las instituciones."
              : "Este servicio tiene una disponibilidad personalizada, por lo que no está disponible para todos los tipos de autobús en todas las instituciones."
          }
        >
          <Link
            href={`services/${params.row.nombre}/disponibilidad`}
            underline="hover"
            color="secondary"
          >
            {params.row.disponibilidad
              ? "Predeterminada"
              : "Personalizada"}
          </Link>
        </Tooltip>
      ),
    },
    {
      field: "estatus",
      headerName: "Estado",
      width: 100,
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      renderCell: (params) => (
        <Chip
          label={params.row.estatus ? "Activo" : "Inactivo"}
          color={params.row.estatus ? "success" : "error"}
          variant="outlined"
        />
      ),
    },
  ];

  return columnas;
};

export default buildServicesColumns;
