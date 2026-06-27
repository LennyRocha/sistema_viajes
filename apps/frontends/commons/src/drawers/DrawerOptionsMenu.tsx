"use client";

import * as React from "react";
import { IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

interface DrawerOptionsMenuProps {
  onMiPerfilClick: () => void;
  onAjustesClick: () => void;
  onCerrarSesionClick: () => void;
}

export default function DrawerOptionsMenu({
  onMiPerfilClick,
  onAjustesClick,
  onCerrarSesionClick,
}: Readonly<DrawerOptionsMenuProps>) {
  const id = React.useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const [anchorEl, setAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        aria-label="options"
        size="small"
        color="inherit"
        id={buttonId}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": buttonId,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            onMiPerfilClick();
          }}
        >
          Mi Perfil
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            onAjustesClick();
          }}
        >
          Ajustes
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            onCerrarSesionClick();
          }}
        >
          Cerrar sesión
        </MenuItem>
      </Menu>
    </div>
  );
}
