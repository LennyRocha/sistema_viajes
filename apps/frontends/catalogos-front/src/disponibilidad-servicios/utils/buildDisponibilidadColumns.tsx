import React from "react";
import { DisponibilidadPorServicio } from "../types/disponibilidad-responses";
import { Simplify, GridColDef } from "@nexoroute/commons";
import TipoAutobus from "../../tipos_autobus/types/TipoAutobus";
import { Check, Remove } from "@mui/icons-material";
import { Chip } from "@mui/material";
import { DisponibilidadServicioResponse } from "../types/disponibilidad-and";

const buildDisponibilidadColumns = (
  tipos: TipoAutobus[],
): GridColDef<DisponibilidadRow>[] => {
  const columnas: GridColDef<DisponibilidadRow>[] = [
    {
      field: "institucion.nombre",
      headerName: "Institución",
      minWidth: 200,
      flex: 1,
      valueGetter: (_, row) => row.institucion.nombre,
    },
    ...tipos.map((tipo, index) => ({
      field: `tipos.${index}.disponibilidad`,
      headerName: tipo.nombre,
      width: 140,
      resizable: false,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params) => {
        const disponibilidad = params.row.tipos[index];
        return disponibilidad ? (
          <Check
            color={"primary"}
            sx={{ margin: "0 auto" }}
          />
        ) : (
          <Remove
            color={"disabled"}
            sx={{ margin: "0 auto" }}
          />
        );
      },
    })),
    {
      field: "estatus",
      headerName: "Estado",
      width: 100,
      sortable: false,
      disableColumnMenu: true,
      resizable: false,
      renderCell: (params) => (
        <Chip
          label={
            params.row.ids.some((id) => id.activo)
              ? "Activo"
              : "Inactivo"
          }
          color={
            params.row.ids.some((id) => id.activo)
              ? "success"
              : "error"
          }
          variant="outlined"
        />
      ),
    },
  ];

  return columnas;
};

type DisponibilidadRow = Simplify<
  DisponibilidadPorServicio & {
    ids: DisponibilidadServicioResponse[];
  }
>;

export default buildDisponibilidadColumns;
