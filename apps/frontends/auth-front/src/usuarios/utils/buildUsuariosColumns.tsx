import React from "react";
import { Chip } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { UsuarioMock } from "../data/constants";

const buildUsuariosColumns = () => {
  const columnas: GridColDef<UsuarioMock>[] = [
    {
      field: "nombre",
      headerName: "Nombre",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "fecha_nacimiento",
      headerName: "Fecha de nacimiento",
      width: 180,
      valueGetter: (_, row) =>
        new Date(row.fecha_nacimiento).toLocaleDateString("es-MX"),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 220,
    },
    {
      field: "password",
      headerName: "Contraseña",
      width: 140,
      sortable: false,
      disableColumnMenu: true,
      renderCell: () => "********",
    },
    {
      field: "estatus",
      headerName: "Estado",
      width: 110,
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

export default buildUsuariosColumns;