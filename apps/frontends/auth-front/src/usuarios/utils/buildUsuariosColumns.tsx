import React from "react";
import { Box, Chip } from "@mui/material";
import { GridColDef } from "@nexoroute/commons";
import Usuario from "../types/Usuario";

const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: "Administrador",
  ROLE_SUPERVISOR: "Supervisor",
  ROLE_OPERADOR: "Operador",
  ROLE_CONDUCTOR: "Conductor",
  ROLE_CLIENTE: "Cliente",
};

export function getRoleLabel(role: string) {
  return ROLE_LABELS[role] ?? role.replace(/^ROLE_/, "").replaceAll("_", " ");
}

function getRoleColor(
  role: string,
): React.ComponentProps<typeof Chip>["color"] {
  switch (role) {
    case "ROLE_ADMIN":
      return "error";
    case "ROLE_SUPERVISOR":
      return "info";
    case "ROLE_OPERADOR":
      return "warning";
    case "ROLE_CONDUCTOR":
      return "success";
    default:
      return "default";
  }
}

function formatBirthDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-MX", { timeZone: "UTC" });
}

const buildUsuariosColumns = (): GridColDef<Usuario>[] => [
  {
    field: "nombreCompleto",
    headerName: "Nombre",
    flex: 1,
    minWidth: 220,
    valueGetter: (_, row) =>
      [row.nombres, row.apellido_paterno, row.apellido_materno]
        .filter(Boolean)
        .join(" "),
  },
  {
    field: "email",
    headerName: "Correo electronico",
    flex: 1,
    minWidth: 240,
  },
  {
    field: "roles",
    headerName: "Roles",
    flex: 1,
    minWidth: 240,
    sortable: false,
    renderCell: ({ row }) =>
      row.roles.length ? (
        <Box sx={{ display: "flex", gap: 0.5, overflow: "hidden" }}>
          {row.roles.map((role) => (
            <Chip
              key={role}
              label={getRoleLabel(role)}
              color={getRoleColor(role)}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      ) : (
        <Chip label="Sin rol" color="warning" size="small" variant="outlined" />
      ),
  },
  {
    field: "telefono",
    headerName: "Telefono",
    width: 150,
  },
  {
    field: "fecha_nacimiento",
    headerName: "Fecha de nacimiento",
    width: 180,
    valueGetter: (_, row) => formatBirthDate(row.fecha_nacimiento),
  },
  {
    field: "estatus",
    headerName: "Estado",
    width: 110,
    sortable: false,
    disableColumnMenu: true,
    resizable: false,
    renderCell: ({ row }) => (
      <Chip
        label={row.estatus ? "Activo" : "Inactivo"}
        color={row.estatus ? "success" : "error"}
        variant="outlined"
        size="small"
      />
    ),
  },
];

export default buildUsuariosColumns;
