import React from "react";
import Conductor from "../types/Conductor";
import { GridColDef } from "@nexoroute/commons";
import { Badge } from "@mui/icons-material";
import { Chip, IconButton, Tooltip } from "@mui/material";

const buildConductoresColumns = (
  onGestionLicencia?: (row: Conductor) => void,
) => {
  const columnas: GridColDef<Conductor>[] = [
    {
      field: "nombres",
      headerName: "Nombre",
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) =>
        `${row.nombres} ${row.apellido_paterno} ${row.apellido_materno}`,
    },
    {
      field: "curp",
      headerName: "CURP",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "telefono",
      headerName: "Teléfono",
      width: 120,
    },
    {
      field: "licencia",
      headerName: "Licencia",
      width: 140,
      sortable: false,
      disableColumnMenu: true,
      valueGetter: (_, row) => row.licencia?.numero_licencia ?? "Sin licencia",
    },
    {
      field: "gestion_licencia",
      headerName: "Gestion",
      width: 92,
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      renderCell: (params) => (
        <Tooltip title="Gestionar licencia">
          <span>
            <IconButton
              aria-label="Gestionar licencia"
              size="small"
              onClick={() => onGestionLicencia?.(params.row)}
            >
              <Badge />
            </IconButton>
          </span>
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
