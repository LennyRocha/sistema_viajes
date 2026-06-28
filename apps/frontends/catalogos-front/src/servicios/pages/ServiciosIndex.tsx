import {
  PaperHeader,
  Breadcrumb,
  Tabla,
} from "@nexoroute/commons";
import React from "react";
import { Add } from "@mui/icons-material";
import { GridColDef } from "@mui/x-data-grid";

interface Props {
  onHeaderButtonClick: () => void;
}

export default function ServiciosIndex({
  onHeaderButtonClick,
}: Readonly<Props>) {
  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          { nombre: "Servicios", href: "/services" },
        ]}
      />
      <PaperHeader
        title="Servicios"
        subtitle="Listado de servicios ofrecidos en los distintos viajes"
        iconname="room_service"
        showButton
        onButtonClick={onHeaderButtonClick}
        buttonTitle="Nuevo"
        leftIcon={<Add />}
      />
      <Tabla
        titulo="Servicios"
        subtitulo="Listado de servicios ofrecidos en los distintos viajes"
        columnas={columns}
        data={rows}
        onEditClick={console.log}
        onDeleteClick={console.log}
        onToggleActiveClick={console.log}
        onInfoClick={console.log}
      />
    </>
  );
}

type Persona = {
  id: number;
  firstName: string;
  lastName: string;
  age: number | null;
  estatus: boolean;
};

const columns: GridColDef<Persona>[] = [
  {
    field: "id",
    headerName: "ID",
    width: 70,
  },
  {
    field: "firstName",
    headerName: "Nombre",
    width: 130,
  },
  {
    field: "lastName",
    headerName: "Apellido",
    width: 130,
  },
  {
    field: "age",
    headerName: "Edad",
    type: "number",
    width: 90,
  },
  {
    field: "fullName",
    headerName: "Nombre completo",
    sortable: false,
    width: 180,
    valueGetter: (_, row) =>
      `${row.firstName ?? ""} ${row.lastName ?? ""}`,
  },
];

const rows: Persona[] = [
  {
    id: 1,
    firstName: "Jon",
    lastName: "Snow",
    age: 35,
    estatus: true,
  },
  {
    id: 2,
    firstName: "Cersei",
    lastName: "Lannister",
    age: 42,
    estatus: false,
  },
];
