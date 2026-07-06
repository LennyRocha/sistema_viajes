import { GridColDef } from "@mui/x-data-grid";
import CampoConfig from "../types/CampoServicio";

const buildServicesColumns = () => {
  const columnas: GridColDef<CampoConfig>[] = [
    {
      field: "tipo",
      headerName: "Tipo",
      width: 150,
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        switch (params.row.tipo) {
          case "string":
            return "Cadena de texto";
          case "number":
            return "Númerico";
          case "boolean":
            return "Condicional";
          default:
            return params.row.tipo;
        }
      },
    },
    {
      field: "label",
      headerName: "Nombre",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "requerido",
      headerName: "Requerido",
      minWidth: 75,
      flex: 1,
      renderCell: (params) => {
        return params.row.requerido ? "Sí" : "No";
      },
    },
    {
      field: "visible",
      headerName: "Visible condicionalmente",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => {
        return params.row.visible ? "Sí" : "No";
      },
    },
  ];

  return columnas;
};

export default buildServicesColumns;
