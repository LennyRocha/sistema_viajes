"use client";
import React from "react";
import {
	PaperHeader,
	Breadcrumb,
	Tabla,
	CommonPageProps,
} from "@nexoroute/commons";
import { Add, FilterList } from "@mui/icons-material";
import {
	Box,
	Button,
	IconButton,
	MenuItem,
	TextField,
} from "@mui/material";
import { usuarios as data } from "../data/constants";
import buildUsuariosColumns from "../utils/buildUsuariosColumns";

export default function UsuariosIndex({
	navigationFunction,
	userPrivileges = [],
}: Readonly<CommonPageProps>) {
	const columnas = buildUsuariosColumns();

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
				subtitle="Listado de usuarios registrados en el sistema"
				iconname="manage_accounts"
				showButton
				onButtonClick={() => navigationFunction("/users/nuevo")}
				buttonTitle="Nuevo"
				leftIcon={<Add />}
			/>
			<Tabla
				titulo="Usuarios"
				subtitulo="Listado de usuarios registrados en el sistema"
				columnas={columnas}
				data={data}
				onEditClick={() => console.log("Editar usuario")}
				onToggleActiveClick={() => console.log("Cambiar estado")}
				subHeaderComponent={
					<Box sx={{ display: "flex", gap: 2 }}>
						<TextField
							label="Buscar por nombre"
							variant="outlined"
							size="small"
							sx={{ flex: 1, minWidth: 200 }}
						/>
						<TextField
							label="Buscar por email"
							variant="outlined"
							size="small"
							sx={{ flex: 1, minWidth: 200 }}
						/>
						<TextField
							select
							label="Estado"
							size="small"
							sx={{ flex: 1, minWidth: 200 }}
							defaultValue=""
						>
							<MenuItem value="">Todos</MenuItem>
							<MenuItem value="activo">Activo</MenuItem>
							<MenuItem value="inactivo">Inactivo</MenuItem>
						</TextField>
						<IconButton aria-label="Filtrar" size="small">
							<FilterList />
						</IconButton>
						<Button
							variant="outlined"
							size="small"
							color="secondary"
						>
							Limpiar filtros
						</Button>
					</Box>
				}
			/>
		</>
	);
}
