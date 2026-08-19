import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { ServicioIcon } from "@nexoroute/commons";

type SalidaDialogProps = {
  open: boolean;
  servicios: any[];
  onClose: () => void;
};
const SalidaDialog = (
  props: Readonly<SalidaDialogProps>,
) => {
  const { onClose, servicios, open } = props;

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Amenidades</DialogTitle>
      <List sx={{ pt: 0 }}>
        {servicios.map((servicio) => (
          <ListItem disablePadding key={servicio.id}>
            <ListItemButton>
              <ListItemAvatar>
                <ServicioIcon
                  size="lg"
                  name={servicio.icono_nombre}
                />
              </ListItemAvatar>
              <ListItemText primary={servicio.nombre} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};

export default SalidaDialog;
