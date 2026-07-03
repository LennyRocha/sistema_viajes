import { Chip } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import Institucion from "../types/Institucion";

const buildInstitucionesColumns = () => {
  const columnas: GridColDef<Institucion>[] = [
    {
      field: "nombre",
      headerName: "Nombre",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "descripcion",
      headerName: "Descripcion",
      flex: 2,
      minWidth: 240,
    },
    {
      field: "estatus",
      headerName: "Estado",
      width: 140,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Chip
          label={params.row.estatus ? "Activa" : "Inactiva"}
          color={params.row.estatus ? "success" : "default"}
          variant="outlined"
        />
      ),
    },
  ];

  return columnas;
};

export default buildInstitucionesColumns;
