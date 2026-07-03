import React from "react";
import {
  PaperHeader,
  Breadcrumb,
  PaperBlock,
  FormButtonsRow,
  CommonPageProps,
} from "@nexoroute/commons";
import { Box, TextField, MenuItem } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";

interface NuevoConductorProps extends CommonPageProps {}

export default function NuevoConductor({
  navigationFunction,
  openSidebar,
  userPrivileges = [],
}: Readonly<NuevoConductorProps>) {
  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          { nombre: "Conductores", href: "/conductores" },
          {
            nombre: "Nuevo",
            href: "/conductores/nuevo",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Nuevo conductor"
        subtitle="Agrega un nuevo conductor para que pueda operar en los viajes"
        iconname="add"
        showButton
        onButtonClick={navigationFunction}
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
            title="Datos personales"
            subtitle="Información básica del conductor"
            contentWrapperSx={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <Box sx={{ display: "flex", gap: "12px", "@media (max-width: 640px)": { flexDirection: "column" } }}>
              <TextField
                label="Nombre *"
                variant="outlined"
                size="small"
                fullWidth
              />
              <TextField
                label="Apellido *"
                variant="outlined"
                size="small"
                fullWidth
              />
            </Box>
            <TextField
              label="Cédula *"
              variant="outlined"
              size="small"
              fullWidth
            />
            <TextField
              label="Email *"
              variant="outlined"
              type="email"
              size="small"
              fullWidth
            />
            <TextField
              label="Teléfono *"
              variant="outlined"
              size="small"
              fullWidth
            />
            <TextField
              label="Fecha de nacimiento *"
              variant="outlined"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </PaperBlock>

          <PaperBlock
            title="Información de licencia"
            subtitle="Datos de la licencia de conducir"
            contentWrapperSx={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <TextField
              label="Número de licencia *"
              variant="outlined"
              size="small"
              fullWidth
            />
            <Box sx={{ display: "flex", gap: "12px", "@media (max-width: 640px)": { flexDirection: "column" } }}>
              <TextField
                label="Fecha de expedición *"
                variant="outlined"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Fecha de vencimiento *"
                variant="outlined"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              label="Estado emisor *"
              variant="outlined"
              size="small"
              fullWidth
            />
          </PaperBlock>

          <FormButtonsRow
            showCancelButton
            showSubmitButton
            cancelButtonText="Cancelar"
            submitButtonText="Guardar"
            onCancel={navigationFunction}
            onSubmit={() => console.log("Guardar conductor")}
          />
        </Box>
      </Box>
    </>
  );
}