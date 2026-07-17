import React from "react";
import { Button, Chip, Link, Tooltip } from "@mui/material";
import ServicioExterno from "../types/ServicioExterno";
import {
  ServicioIcon,
  Simplify,
  GridColDef,
} from "@nexoroute/commons";

const buildServicesColumns = (
  funct: (servicio: ServicioRow) => void,
): GridColDef<ServicioRow>[] => {
  const columnas: GridColDef<ServicioRow>[] = [
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
            params.row.disponibilidad?.length > 0
              ? "Este servicio tiene una disponibilidad personalizada, por lo que no está disponible para todos los tipos de autobús en todas las instituciones."
              : "Este servicio está disponible para todos los tipos de autobús en todas las instituciones."
          }
        >
          <Link
            href={`services/${params.row.nombre}/disponibilidad`}
            underline="hover"
            color="secondary"
          >
            {params.row.disponibilidad?.length > 0
              ? "Personalizada"
              : "Predeterminada"}
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

type ServicioRow = Simplify<ServicioExterno>;

export default buildServicesColumns;
