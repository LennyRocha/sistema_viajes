import React from "react";
import Conductor from "../types/Conductor";
import { GridColDef } from "@mui/x-data-grid";
import { Chip } from "@mui/material";

const buildConductoresColumns = () => {
  const columnas: GridColDef<Conductor>[] = [
    {
      field: "nombre",
      headerName: "Nombre",
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) =>
        `${row.nombre} ${row.apellido}`,
    },
    {
      field: "curp",
      headerName: "Cédula",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "telefono",
      headerName: "Teléfono",
      width: 120,
    },
    {
      field: "licencia",
      headerName: "Licencia",
      width: 120,
      sortable: false,
      disableColumnMenu: true,
      valueGetter: (_, row) => row.licencia.numeroLicencia,
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
          label={params.row.estado ? "Activo" : "Inactivo"}
          color={params.row.estado ? "success" : "error"}
          variant="outlined"
        />
      ),
    },
    {
      field: "institucion",
      headerName: "Institución",
      flex: 1,
      minWidth: 150,
      valueGetter: (_, row) => row.institucion.nombre,
    },
  ];

  return columnas;
};

export default buildConductoresColumns;
