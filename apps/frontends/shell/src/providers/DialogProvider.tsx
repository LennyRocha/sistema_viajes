"use client";

import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useSidebar } from "./SidebarProvider";
import {
  type DialogProps,
  DialogProviderProps,
  DialogProviderValues,
} from "@nexoroute/commons";

const DialogContext = React.createContext<
  DialogProviderValues | undefined
>(undefined);

export function DialogProvider({
  children,
}: Readonly<DialogProviderProps>) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down("sm"),
  );

  const { hideSidebar } = useSidebar();

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const [dialogProps, setDialogProps] =
    React.useState<DialogProps | null>(null);

  const showDialog = (props: DialogProps) => {
    hideSidebar();
    setDialogProps(props);
    setDialogOpen(true);
  };

  const current = dialogProps;

  const hideDialog = async () => {
    await current?.onClose?.();
    setDialogOpen(false);
    setDialogProps(null);
  };

  const confirmDialog = async () => {
    await current?.onConfirm?.();
    setDialogOpen(false);
    setDialogProps(null);
  };

  const contextValue = React.useMemo(
    () => ({
      showDialog,
      hideDialog,
    }),
    [],
  );

  return (
    <DialogContext.Provider value={contextValue}>
      <Dialog
        open={dialogOpen}
        onClose={(_, reason) => {
          if (reason === "backdropClick") return;
          hideDialog();
        }}
        sx={{
          "& .MuiDialog-paper": {
            minWidth: 350,
          },
        }}
        fullScreen={fullScreen}
      >
        <Box
          sx={{
            fontSize: 24,
            fontWeight: 600,
            px: 3,
            pt: 2,
            pb: 1,
            position: "relative",
          }}
        >
          {dialogProps?.title}
          {dialogProps?.showCloseButton && (
            <IconButton
              aria-label="close"
              onClick={hideDialog}
              sx={(theme) => ({
                position: "absolute",
                right: 8,
                top: 10,
                color: theme.palette.grey[500],
              })}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <DialogContent dividers>
          {dialogProps?.content}
        </DialogContent>
        <DialogActions>
          {dialogProps?.showCancelButton && (
            <Button
              onClick={hideDialog}
              loading={dialogProps?.isLoading}
            >
              {dialogProps?.cancelText || "Cancelar"}
            </Button>
          )}
          <Button
            autoFocus
            onClick={confirmDialog}
            disabled={dialogProps?.confirmDisabled}
            loading={dialogProps?.isLoading}
          >
            {dialogProps?.confirmText || "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
      {children}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error(
      "useDialog must be used within DialogProvider",
    );
  }
  return context;
}
