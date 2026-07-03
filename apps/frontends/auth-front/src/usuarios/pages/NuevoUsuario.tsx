"use client";
import React from "react";
import {
	PaperHeader,
	Breadcrumb,
	PaperBlock,
	FormButtonsRow,
	CommonPageProps,
} from "@nexoroute/commons";
import { Box, MenuItem, TextField } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";

interface NuevoUsuarioProps extends CommonPageProps {}

export default function NuevoUsuario({
	navigationFunction,
	openSidebar,
	userPrivileges = [],
}: Readonly<NuevoUsuarioProps>) {
	return (
		<>
			<Breadcrumb
				rolActual="Rol actual"
				breads={[
					{ nombre: "Usuarios", href: "/usuarios" },
					{
						nombre: "Nuevo",
						href: "/usuarios/nuevo",
						disabled: true,
					},
				]}
			/>
			<PaperHeader
				title="Nuevo usuario"
				subtitle="Agrega un nuevo usuario al sistema para administrar su acceso"
				iconname="person_add"
				showButton
				onButtonClick={() => navigationFunction("/usuarios")}
				buttonTitle="Volver"
				leftIcon={<ChevronLeft />}
			/>
			<Box
				sx={{
					display: "flex",
					gap: "12px",
					alignItems: "stretch",
					"@media (max-width: 768px)": {
						flexDirection: "column",
					},
				}}
			>
				<Box
					sx={{
						width: "100%",
						"@media (min-width: 640px)": {
							flex: 2,
						},
					}}
				>
					<PaperBlock
						title="Datos generales"
						subtitle="Captura la información básica del usuario"
						contentWrapperSx={{
							display: "flex",
							flexDirection: "column",
							gap: "12px",
						}}
					>
						<TextField
							label="Nombre *"
							variant="outlined"
							size="small"
							fullWidth
						/>
						<TextField
							label="Email *"
							variant="outlined"
							size="small"
							type="email"
							fullWidth
						/>
						<TextField
							label="Fecha de nacimiento *"
							variant="outlined"
							size="small"
							type="date"
							fullWidth
							InputLabelProps={{ shrink: true }}
						/>
						<TextField
							select
							label="Estado *"
							size="small"
							fullWidth
							defaultValue="activo"
						>
							<MenuItem value="activo">Activo</MenuItem>
							<MenuItem value="inactivo">Inactivo</MenuItem>
						</TextField>
					</PaperBlock>

					<PaperBlock
						title="Seguridad"
						subtitle="Define las credenciales de acceso del usuario"
						contentWrapperSx={{
							display: "flex",
							flexDirection: "column",
							gap: "12px",
						}}
					>
						<TextField
							label="Contraseña *"
							variant="outlined"
							size="small"
							type="password"
							fullWidth
						/>
						<TextField
							label="Confirmar contraseña *"
							variant="outlined"
							size="small"
							type="password"
							fullWidth
						/>
					</PaperBlock>

					<FormButtonsRow
						showCancelButton
						showSubmitButton
						cancelButtonText="Cancelar"
						submitButtonText="Guardar"
						onCancel={() => navigationFunction("/usuarios")}
						onSubmit={() => console.log("Guardar usuario")}
					/>
				</Box>
			</Box>
		</>
	);
}
