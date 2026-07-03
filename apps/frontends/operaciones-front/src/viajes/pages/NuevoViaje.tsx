"use client";

import {
  Breadcrumb,
  CommonPageProps,
  FormButtonsRow,
  PaperBlock,
  PaperHeader,
} from "@nexoroute/commons";
import { ChevronLeft } from "@mui/icons-material";
import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
} from "@mui/material";
import GoogleRouteMap from "../components/GoogleRouteMap";
import { rutasBase } from "../data/viajesMock";

interface Props extends CommonPageProps {
  viajeId?: string;
}

const servicios = [
  "WiFi",
  "Aire acondicionado",
  "Equipaje",
  "Pantallas",
  "Cargadores USB",
];

export default function NuevoViaje({
  navigationFunction,
  snack,
  viajeId,
}: Readonly<Props>) {
  const isEditing = Boolean(viajeId);
  const previewRoute = rutasBase[0];
  const previewPoints = [
    previewRoute.origen,
    ...previewRoute.paradas,
    previewRoute.destino,
  ];

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          { nombre: "Viajes", href: "/trips" },
          {
            nombre: isEditing ? "Editar" : "Nuevo",
            href: isEditing
              ? `/trips/editar/${viajeId}`
              : "/trips/nuevo",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title={isEditing ? "Editar viaje base" : "Nuevo viaje base"}
        subtitle="Define rutas asociadas, servicios y apertura operativa"
        iconname={isEditing ? "edit" : "add"}
        showButton
        onButtonClick={() => navigationFunction("/trips")}
        buttonTitle="Volver"
        leftIcon={<ChevronLeft />}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1fr) minmax(360px, 0.8fr)",
          },
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <PaperBlock
            title="Datos generales"
            subtitle="Informacion base para reutilizar este viaje en calendario"
            contentWrapperSx={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <TextField
              label="Nombre del viaje base *"
              variant="outlined"
              size="small"
              fullWidth
              defaultValue={
                isEditing ? "Viaje escolar matutino" : undefined
              }
            />
            <TextField
              label="Descripcion *"
              variant="outlined"
              size="small"
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              select
              label="Frecuencia"
              size="small"
              defaultValue="lunes-viernes"
              fullWidth
            >
              <MenuItem value="lunes-viernes">
                Lunes a viernes
              </MenuItem>
              <MenuItem value="interdiario">
                Lunes, miercoles y viernes
              </MenuItem>
              <MenuItem value="demanda">Bajo demanda</MenuItem>
            </TextField>
          </PaperBlock>

          <PaperBlock
            title="Rutas asociadas"
            subtitle="Selecciona una o varias rutas para componer el viaje base"
            contentWrapperSx={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {rutasBase.map((ruta, index) => (
              <FormControlLabel
                key={ruta.id}
                control={<Checkbox defaultChecked={index === 0} />}
                label={`${ruta.nombre} (${ruta.distanciaKm} km)`}
              />
            ))}
          </PaperBlock>

          <PaperBlock
            title="Servicios asociados"
            subtitle="Estos servicios se aplicaran a las salidas generadas"
            contentWrapperSx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: "8px",
            }}
          >
            {servicios.map((servicio, index) => (
              <FormControlLabel
                key={servicio}
                control={<Checkbox defaultChecked={index < 2} />}
                label={servicio}
              />
            ))}
          </PaperBlock>
        </Box>

        <PaperBlock
          title="Previsualizacion"
          subtitle="La ruta principal se mostrara en el mapa"
          contentWrapperSx={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <GoogleRouteMap points={previewPoints} />
        </PaperBlock>
      </Box>

      <FormButtonsRow
        hasRequiredFields
        submitText="Guardar"
        resetText="Cancelar"
        onSubmitClick={() => {
          snack?.success({
            message: isEditing
              ? "Viaje base actualizado"
              : "Viaje base creado",
          });
          navigationFunction("/trips");
        }}
        onResetClick={() => navigationFunction("/trips")}
      />
    </>
  );
}
