"use client";

import { createContext, type ReactNode } from "react";
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

type DialogProps = {
  title: string;
  content: ReactNode;
  onClose: () => void | Promise<void>;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
  showCloseButton?: boolean;
};

interface DialogProviderValues {
  showDialog: (props: DialogProps) => void;
  hideDialog: () => void;
}

interface DialogProviderProps {
  children: ReactNode;
}

const DialogContext = createContext<
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
    setDialogOpen(false);
    setDialogProps(null);

    await current?.onClose?.();
  };

  const confirmDialog = async () => {
    setDialogOpen(false);
    setDialogProps(null);

    await current?.onConfirm?.();
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
            minWidth: 300,
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
            <Button onClick={hideDialog}>
              {dialogProps?.cancelText || "Cancelar"}
            </Button>
          )}
          <Button autoFocus onClick={confirmDialog}>
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
