import MotionPaper from "./MotionPaper";
import { Box, Typography, Button } from "@mui/material";

type Props = {
  onSubmitClick: () => void;
  onResetClick: () => void;
  hasRequiredFields: boolean;
  submitText?: string;
  resetText?: string;
  submitDisabled?: boolean;
  resetDisabled?: boolean;
  isLoading?: boolean;
};

const FormButtonsRow = ({
  onSubmitClick,
  onResetClick,
  hasRequiredFields,
  submitText,
  resetText,
  submitDisabled,
  resetDisabled,
  isLoading = false,
}: Props) => {
  return (
    <MotionPaper
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "start",
        gap: "12px",
        padding: "12px",
        width: "100%",
      }}
    >
      {hasRequiredFields && (
        <Typography variant="caption" color="error">
          <b style={{ color: "red" }}>*</b> Campos
          obligatorios
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          gap: "12px",
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          onClick={onResetClick}
          disabled={resetDisabled}
          sx={{
            "@media (max-width: 640px)": {
              flex: 1,
            },
          }}
          loading={isLoading}
        >
          {resetText || "Restablecer"}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onSubmitClick}
          disabled={submitDisabled}
          sx={{
            "@media (max-width: 640px)": {
              flex: 1,
            },
          }}
          loading={isLoading}
        >
          {submitText || "Enviar"}
        </Button>
      </Box>
    </MotionPaper>
  );
};

export default FormButtonsRow;
