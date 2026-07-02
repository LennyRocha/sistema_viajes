import { Search } from "@mui/icons-material";
import {
  Box,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import {
  DynamicIcon,
  EmptyState,
  PaperBlock,
  type SidebarConfig,
} from "@nexoroute/commons";
import React from "react";
import ServicioExterno from "../../servicios/types/ServicioExterno";
import { servicios } from "../../data/constants";
import Add from "@mui/icons-material/Add";

type Props = {
  existingServices?: ServicioExterno[];
  openSidebar: (config: SidebarConfig) => void;
};

export default function SelectorServicios({
  existingServices,
  openSidebar,
}: Readonly<Props>) {
  const [selectedServices, setSelectedServices] =
    React.useState<ServicioExterno[]>(
      existingServices ?? [],
    );
  return (
    <PaperBlock
      title="Servicios disponibles"
      subtitle="Selecciona los servicios que ofrece esta unidad, selecciona al menos uno."
      contentWrapperSx={{
        display: "flex",
        gap: "12px",
        "@media (max-width: 640px)": {
          flexDirection: "column",
        },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <TextField
          label="Buscar servicio"
          variant="outlined"
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <IconButton
                  aria-label="Buscar servicio"
                  size="small"
                >
                  <Search />
                </IconButton>
              ),
            },
          }}
          fullWidth
        />
        <Box
          sx={{
            maxHeight: 320,
            overflowY: "auto",
            flex: 1,
          }}
        >
          {servicios.map((servicio) => (
            <ListItem
              key={servicio.id}
              secondaryAction={
                <IconButton edge="end" aria-label="add_service" color="primary">
                  <Add />
                </IconButton>
              }
            >
              <ListItemIcon>
                <DynamicIcon name={servicio.icono_nombre} />
              </ListItemIcon>
              <ListItemText>{servicio.nombre}</ListItemText>
            </ListItem>
          ))}
        </Box>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" gutterBottom>
          {selectedServices.length} servicios seleccionados
        </Typography>
        {selectedServices.length === 0 ? (
          <EmptyState
            variant="no-results"
            title="No hay servicios agregados"
          />
        ) : (
          <></>
        )}
      </Box>
    </PaperBlock>
  );
}
