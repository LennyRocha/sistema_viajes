import React from "react";
import Autobus from "../types/Autobus";
import { GridColDef } from "@mui/x-data-grid";
import { Chip, Typography } from "@mui/material";

const buildAutobusesColumns = () => {
  const columnas: GridColDef<Autobus>[] = [
    {
      field: "marca",
      headerName: "Autobús",
      flex: 1,
      minWidth: 200,
      valueGetter: (_, row) => `${row.marca} ${row.modelo}`,
    },
    {
      field: "capacidad",
      headerName: "Capacidad",
      width: 90,
      resizable: false,
    },
    {
      field: "tipo",
      headerName: "Tipo",
      width: 110,
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
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
    {
      field: "estado",
      headerName: "Estado",
      width: 155,
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        if (!params.row.estatus) {
          return (
            <Chip
              label="Inactivo"
              color="default"
              variant="outlined"
            />
          );
        }
        return (
          <Chip
            label={params.row.estado}
            color={estadoColorMap[params.row.estado]}
            variant="outlined"
          />
        );
      },
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
