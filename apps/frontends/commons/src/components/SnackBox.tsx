import React from "react";
import {
  Snackbar,
  Alert,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import {
  subscribe,
  getSnacks,
  removeSnack,
  addSnack,
} from "./SnackbarStore";
import SnackbarProps, {
  SnackbarAlertPublicProps,
  SnackbarPublicProps,
} from "../types/SnackbarProps";

const DEFAULT_ANCHOR = {
  vertical: "bottom",
  horizontal: "right",
} as const;

export function SnackBox() {
  const [, force] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    return subscribe(force);
  }, []);

  const snacks = getSnacks();

  return snacks.map((snack, index) => {
    const action = (
      <>
        {snack.onUndoClick && (
          <Button
            color="secondary"
            size="small"
            onClick={snack.onUndoClick}
          >
            Deshacer
          </Button>
        )}
        {snack.showCloseButton && (
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={snack.onClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </>
    );
    const handleClose = (
      _: React.SyntheticEvent | Event,
      reason?: string,
    ) => {
      if (reason === "clickaway") return;

      removeSnack(snack.id!);
      snack.onClose?.();
    };
    return "snackSeverity" in snack ? (
      <Snackbar
        key={snack.id}
        open
        autoHideDuration={snack.duration ?? 6000}
        onClose={handleClose}
        anchorOrigin={snack.anchorOrigin || DEFAULT_ANCHOR}
        sx={{
          bottom: `${24 + index * 70}px !important`,
        }}
      >
        <Alert
          onClose={handleClose}
          severity={snack.snackSeverity || "info"}
          variant={snack.snackAlertVariant || "filled"}
          sx={{ width: "100%", color: "white" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    ) : (
      <Snackbar
        key={snack.id}
        open
        autoHideDuration={snack.duration ?? 6000}
        onClose={handleClose}
        anchorOrigin={snack.anchorOrigin || DEFAULT_ANCHOR}
        message={snack.message}
        sx={{
          bottom: `${24 + index * 70}px !important`,
        }}
        action={action}
      />
    );
  });
}

export const snack = {
  show({
    message,
    onClose,
    showCloseButton,
    onUndoClick,
    anchorOrigin,
    duration,
  }: SnackbarPublicProps) {
    const snack: SnackbarProps = {
      message,
      onClose,
      showCloseButton,
      onUndoClick,
      anchorOrigin,
      duration,
    };
    addSnack(snack);
  },
  success(props: SnackbarAlertPublicProps) {
    addSnack({
      ...props,
      snackSeverity: "success",
    });
  },

  error(props: SnackbarAlertPublicProps) {
    addSnack({
      ...props,
      snackSeverity: "error",
    });
  },

  warning(props: SnackbarAlertPublicProps) {
    addSnack({
      ...props,
      snackSeverity: "warning",
    });
  },

  info(props: SnackbarAlertPublicProps) {
    addSnack({
      ...props,
      snackSeverity: "info",
    });
  },
};
