import {
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import ViajeBase from "../types/ViajeBase";

type Props = {
  viaje: ViajeBase;
};

export default function ViajeDetails({ viaje }: Readonly<Props>) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: 600 }}
        >
          {viaje.nombre}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {viaje.descripcion}
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        <Chip
          label={viaje.estatus ? "Activo" : "Inactivo"}
          color={viaje.estatus ? "success" : "default"}
          variant="outlined"
        />
        <Chip label={`${viaje.duracionTotalMin || 0} min`} variant="outlined" />
        <Chip
          label={`${viaje.rutas.length} ruta(s)`}
          color="primary"
          variant="outlined"
        />
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Rutas asociadas
        </Typography>
        <List dense>
          {viaje.rutas.map((ruta) => (
            <ListItem key={ruta.id} disableGutters>
              <ListItemText
                primary={ruta.nombre}
                secondary={`${ruta.origen.nombre} -> ${ruta.destino.nombre}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Servicios
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {viaje.servicios.map((servicio) => (
            <Chip key={servicio} label={servicio} size="small" />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
