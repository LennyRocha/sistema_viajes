import React from "react";
import Autobus from "../types/Autobus";
import { GridColDef } from "@mui/x-data-grid";
import { Chip, Typography } from "@mui/material";

const buildAutobusesColumns = () => {
  const columnas: GridColDef<Autobus>[] = [
    {
      field: "marca",
      headerName: "Marca",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "capacidad",
      headerName: "Capacidad",
      width: 90,
    },
    {
      field: "modelo",
      headerName: "Modelo",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "tipo",
      headerName: "Tipo",
      width: 100,
      sortable: false,
      disableColumnMenu: true,  
      renderCell: (params) => (
        <Typography
          sx={{
            fontStyle: "italic",
            textTransform: "uppercase",
            color: "accent.main",
          }}
        >
          {params.row.tipo.linea}
        </Typography>
      ),
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 175,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Chip
            label={params.row.estado}
            color={estadoColorMap[params.row.estado]}
            variant="outlined"
          />
        );
      },
    },
    {
      field: "institucion",
      headerName: "Institución",
      flex: 1,
      minWidth: 150,
      valueGetter: (_, row) => row.institucion.nombre,
    },
    {
      field: "codigo_interno",
      headerName: "Código interno",
      flex: 1,
      minWidth: 100,
    },
  ];

  return columnas;
};

export default buildAutobusesColumns;

const estadoColorMap = {
  Disponible: "success",
  "En viaje": "warning",
  "En mantenimiento": "info",
  "Fuera de servicio": "error",
} as const;
