"use client";

import React from "react";
import {
  Breadcrumb,
  CommonPageProps,
  hasPrivilege,
  PaperHeader,
  Tabla,
} from "@nexoroute/commons";
import { Add, FilterAltOff, Refresh } from "@mui/icons-material";
import { Alert, Box, Button, MenuItem, TextField } from "@mui/material";
import {
  getUsuarios,
  toggleUsuarioStatus,
} from "../api/usuariosApi";
import Usuario from "../types/Usuario";
import buildUsuariosColumns, {
  getRoleLabel,
} from "../utils/buildUsuariosColumns";

type StatusFilter = "todos" | "activo" | "inactivo";

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("es-MX");
}

export default function UsuariosIndex({
  navigationFunction,
  userPrivileges = [],
  userRoles = [],
  snack,
}: Readonly<CommonPageProps>) {
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [changingUserId, setChangingUserId] = React.useState<number | null>(null);
  const [searchNombre, setSearchNombre] = React.useState("");
  const [searchEmail, setSearchEmail] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");
  const [statusFilter, setStatusFilter] =
    React.useState<StatusFilter>("todos");

  const canCreate = hasPrivilege(
    userPrivileges,
    userRoles,
    "usuarios:crear",
  );
  const canChangeStatus = hasPrivilege(
    userPrivileges,
    userRoles,
    "usuarios:estado",
  );
  const columnas = React.useMemo(() => buildUsuariosColumns(), []);

  const loadUsuarios = React.useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      setUsuarios(await getUsuarios(signal));
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la lista de usuarios",
      );
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    void loadUsuarios(controller.signal);
    return () => controller.abort();
  }, [loadUsuarios]);

  const roleOptions = React.useMemo(
    () =>
      [...new Set(usuarios.flatMap((usuario) => usuario.roles))].sort((a, b) =>
        getRoleLabel(a).localeCompare(getRoleLabel(b), "es-MX"),
      ),
    [usuarios],
  );

  const filteredUsuarios = React.useMemo(() => {
    const nombre = normalize(searchNombre);
    const email = normalize(searchEmail);

    return usuarios.filter((usuario) => {
      const nombreCompleto = normalize(
        [
          usuario.nombres,
          usuario.apellido_paterno,
          usuario.apellido_materno,
        ]
          .filter(Boolean)
          .join(" "),
      );
      const matchesNombre = !nombre || nombreCompleto.includes(nombre);
      const matchesEmail = !email || normalize(usuario.email).includes(email);
      const matchesRole = !roleFilter || usuario.roles.includes(roleFilter);
      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "activo" && usuario.estatus) ||
        (statusFilter === "inactivo" && !usuario.estatus);

      return matchesNombre && matchesEmail && matchesRole && matchesStatus;
    });
  }, [roleFilter, searchEmail, searchNombre, statusFilter, usuarios]);

  const hasActiveFilters = Boolean(
    searchNombre.trim() ||
      searchEmail.trim() ||
      roleFilter ||
      statusFilter !== "todos",
  );

  const clearFilters = () => {
    setSearchNombre("");
    setSearchEmail("");
    setRoleFilter("");
    setStatusFilter("todos");
  };

  const handleToggleStatus = async (usuario: Usuario) => {
    setChangingUserId(usuario.id);
    try {
      await toggleUsuarioStatus(usuario.id);
      snack?.success({
        message: usuario.estatus
          ? "Usuario desactivado correctamente"
          : "Usuario activado correctamente",
      });
      await loadUsuarios();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado del usuario";
      setErrorMessage(message);
      snack?.error({ message });
    } finally {
      setChangingUserId(null);
    }
  };

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          {
            nombre: "Usuarios",
            href: "/users",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Usuarios"
        subtitle="Cuentas, roles y estado de acceso al sistema"
        iconname="manage_accounts"
        showButton
        onButtonClick={() => navigationFunction("/users/nuevo")}
        buttonTitle="Nuevo"
        buttonDisabled={!canCreate}
        leftIcon={<Add />}
      />

      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<Refresh />}
              onClick={() => void loadUsuarios()}
            >
              Reintentar
            </Button>
          }
        >
          {errorMessage}
        </Alert>
      )}

      <Tabla<Usuario>
        titulo="Usuarios"
        subtitulo={`${filteredUsuarios.length} de ${usuarios.length} usuario(s)`}
        columnas={columnas}
        data={filteredUsuarios}
        isLoading={isLoading || changingUserId !== null}
        onToggleActiveClick={canChangeStatus ? handleToggleStatus : undefined}
        subHeaderComponent={
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(180px, 1fr))",
                xl: "repeat(4, minmax(170px, 1fr)) auto",
              },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <TextField
              label="Buscar por nombre"
              size="small"
              value={searchNombre}
              onChange={(event) => setSearchNombre(event.target.value)}
            />
            <TextField
              label="Buscar por correo"
              size="small"
              value={searchEmail}
              onChange={(event) => setSearchEmail(event.target.value)}
            />
            <TextField
              select
              label="Rol"
              size="small"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>
                  {getRoleLabel(role)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Estado"
              size="small"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
            </TextField>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<FilterAltOff />}
              disabled={!hasActiveFilters}
              onClick={clearFilters}
            >
              Limpiar
            </Button>
          </Box>
        }
      />

      {!isLoading && !errorMessage && filteredUsuarios.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {hasActiveFilters
            ? "No se encontraron usuarios con los filtros aplicados."
            : "Todavia no hay usuarios registrados en el sistema."}
        </Alert>
      )}
    </>
  );
}
