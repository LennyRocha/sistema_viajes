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
import tiposBus from "../../tipos_autobus/constants/TiposBusMapper";
import VehiculoPreview from "../components/VehiculoPreview";
import SelectorServicios from "../components/SelectorServicios";

interface NuevoAutobusProps extends CommonPageProps {}

export default function NuevoAutobus({
  navigationFunction,
  openSidebar,
  userPrivileges = [],
}: Readonly<NuevoAutobusProps>) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          { nombre: "Autobuses", href: "/buses" },
          {
            nombre: "Nuevo",
            href: "/buses/nuevo",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Nuevo autobús"
        subtitle="Agrega un nuevo autobús para que se pueda utilizar en los viajes"
        iconname="add"
        showButton
        onButtonClick={() => navigationFunction("/buses")}
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
          ref={ref}
          sx={{
            width: "100%",
            "@media (min-width: 640px)": {
              flex: 2,
            },
          }}
        >
          <PaperBlock
            title="Datos generales"
            subtitle="Define el alias con el se identificará a esta unidad e ingresa sus respectivos datos de identificación adicional"
            contentWrapperSx={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <TextField
              label="Alias del autobús *"
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
            <Box
              sx={{
                display: "flex",
                gap: "12px",
                "@media (max-width: 640px)": {
                  flexDirection: "column",
                  flexWrap: "wrap-reverse",
                },
              }}
            >
              <TextField
                label="Código interno *"
                variant="outlined"
                size="small"
                fullWidth
              />
              <TextField
                label="Institución perteneciente *"
                variant="outlined"
                size="small"
                fullWidth
              />
            </Box>
            <TextField
              id="outlined-select-currency"
              select
              label="Tipo de autobús *"
              defaultValue={tiposBus[0].value}
              size="small"
              onChange={(e) => console.log(e.target.value)}
            >
              {tiposBus.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </PaperBlock>
        </Box>
        <VehiculoPreview model="hyundai" />
      </Box>
      <PaperBlock
        title="Datos del vehículo"
        subtitle="Define las especificaciones técnicas de la unidad y su capacidad de pasajeros"
        contentWrapperSx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "12px",
            "@media (max-width: 640px)": {
              flexDirection: "column",
            },
          }}
        >
          <TextField
            label="Marca *"
            variant="outlined"
            size="small"
            fullWidth
          />
          <TextField
            label="Modelo *"
            variant="outlined"
            size="small"
            fullWidth
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: "12px",
            "@media (max-width: 640px)": {
              flexDirection: "column",
            },
          }}
        >
          <TextField
            label="Año *"
            variant="outlined"
            size="small"
            fullWidth
            defaultValue={"2026"}
            select
          >
            {[
              2000, 2001, 2002, 2003, 2004, 2005, 2006,
              2007, 2008, 2009, 2010, 2011, 2012, 2013,
              2014, 2015, 2016, 2017, 2018, 2019, 2020,
              2021, 2022, 2023, 2024, 2025, 2026,
            ].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Color *"
            variant="outlined"
            size="small"
            fullWidth
          />
        </Box>
        <TextField
          label="Capacidad total *"
          variant="outlined"
          size="small"
          type="number"
          inputMode="numeric"
          slotProps={{
            htmlInput: {
              min: 1,
              max: 20,
              step: 1,
            },
          }}
          fullWidth
        />
      </PaperBlock>
      <SelectorServicios openSidebar={openSidebar} />
      <FormButtonsRow
        onSubmitClick={console.log}
        onResetClick={() =>
          openSidebar({
            title: "Hola",
            children: <div>Hola</div>,
          })
        }
        hasRequiredFields
      />
    </>
  );
}
