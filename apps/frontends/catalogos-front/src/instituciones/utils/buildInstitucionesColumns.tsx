import { Chip } from "@mui/material";
import { GridColDef } from "@nexoroute/commons";
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

export default buildInstitucionesColumns;
