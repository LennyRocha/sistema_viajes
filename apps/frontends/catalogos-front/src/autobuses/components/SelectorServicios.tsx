import { Search } from "@mui/icons-material";
import {
  Box,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { EmptyState, PaperBlock } from "@nexoroute/commons";
import React from "react";

type Props = {};

export default function SelectorServicios({}: Props) {
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
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" gutterBottom>
          Servicios seleccionados
        </Typography>
        <EmptyState
          variant="no-results"
          title="No hay servicios agregados"
        />
      </Box>
    </PaperBlock>
  );
}
