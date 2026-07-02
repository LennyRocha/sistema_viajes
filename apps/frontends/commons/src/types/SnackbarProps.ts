type SnackbarProps = {
  id?: string;
  message: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  onUndoClick?: () => void;
  anchorOrigin?: {
    vertical: "top" | "bottom";
    horizontal: "left" | "center" | "right";
  };
};

export type SnackbarAlertProps = SnackbarProps & {
  snackSeverity?: "error" | "warning" | "info" | "success";
  snackAlertVariant?: "filled" | "outlined" | "standard";
};

export type SnackbarPublicProps = Omit<SnackbarProps, "id">;

export type SnackbarAlertPublicProps = Omit<
  SnackbarAlertProps,
  "id" | "snackSeverity"
>;

export type Snack = SnackbarProps | SnackbarAlertProps;

export default SnackbarProps;
