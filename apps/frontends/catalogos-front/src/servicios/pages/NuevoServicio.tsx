import React from "react";
import {
  PaperHeader,
  Breadcrumb,
  PaperBlock,
  FormButtonsRow,
  CommonPageProps,
  DynamicIcon,
  EmptyState,
} from "@nexoroute/commons";
import {
  Box,
  Button,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { Add, ChevronLeft } from "@mui/icons-material";
interface NuevoServicioProps extends CommonPageProps {}

export default function NuevoServicio({
  navigationFunction,
  openSidebar,
  userPrivileges = [],
}: Readonly<NuevoServicioProps>) {
  return (
    <>
      {" "}
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          { nombre: "Servicios", href: "/servicios" },
          {
            nombre: "Nuevo",
            href: "/servicios/nuevo",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Nuevo servicio"
        subtitle="Agrega un nuevo servicio para que se pueda utilizar en los viajes"
        iconname="add"
        showButton
        onButtonClick={() =>
          navigationFunction("/services")
        }
        buttonTitle="Volver"
        leftIcon={<ChevronLeft />}
      />
      <PaperBlock
        title="Datos generales del servicio"
        subtitle="Define el nombre con el se identificará a este servicio e ingresa sus respectivos datos de identificación adicional"
        contentWrapperSx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <TextField
          label="Nombre del servicio *"
          variant="outlined"
          size="small"
          fullWidth
        />
        <TextField
          label="Descripción *"
          variant="outlined"
          size="small"
          fullWidth
          multiline
          rows={4}
        />
      </PaperBlock>
      <PaperBlock
        title="Icono representativo"
        subtitle="Selecciona un ícono que representará este servicio o puedes dejar el ícono que se muestra por defecto"
        contentWrapperSx={{
          display: "flex",
          flexDirection: "row",
          gap: "12px",
        }}
      >
        <Box
          sx={(theme) => ({
            backgroundColor: alpha(
              theme.palette.accent.main,
              0.08,
            ),
            borderRadius: 2,
            width: 75,
            height: 75,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <DynamicIcon
            name="room_service"
            size="xxxl"
            color="accent"
            filled
          />
        </Box>
        <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center"
        }}
        >
          <Typography
            variant="overline"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Icono actual
          </Typography>
          <Button variant="contained">Cambiar icono</Button>
        </Box>
      </PaperBlock>
      <PaperBlock
        title="Icono representativo"
        subtitle="Selecciona un ícono que representará este servicio o puedes dejar el ícono que se muestra por defecto"
        contentWrapperSx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" gutterBottom>
            {" "}
            0 propiedades definidas
          </Typography>
          <Button startIcon={<Add />} variant="contained">
            Agregar
          </Button>
        </Box>
        <EmptyState
          variant="no-data"
          title="Sin propiedades definidas"
        />
      </PaperBlock>
      <FormButtonsRow
        onSubmitClick={console.log}
        hasRequiredFields
        onResetClick={() =>
          openSidebar({
            title: "Hola",
            children: <div>Hola</div>,
          })
        }
      />
    </>
  );
}
