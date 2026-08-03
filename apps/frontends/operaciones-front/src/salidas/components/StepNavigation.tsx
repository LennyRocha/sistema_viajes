"use client";

import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SaveIcon from "@mui/icons-material/Save";
import { Button, CircularProgress, Stack } from "@mui/material";

export default function StepNavigation({
  activeStep,
  totalSteps,
  canContinue,
  isSaving,
  onBack,
  onNext,
  onSave,
}: Readonly<{
  activeStep: number;
  totalSteps: number;
  canContinue: boolean;
  isSaving: boolean;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
}>) {
  const isLastStep = activeStep === totalSteps - 1;

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        justifyContent: "space-between",
        mt: 2,
        pb: 2,
      }}
    >
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        disabled={activeStep === 0 || isSaving}
        onClick={onBack}
      >
        Anterior
      </Button>
      {isLastStep ? (
        <Button
          variant="contained"
          color="secondary"
          startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          disabled={!canContinue || isSaving}
          onClick={onSave}
        >
          Guardar salida
        </Button>
      ) : (
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          disabled={!canContinue || isSaving}
          onClick={onNext}
        >
          Siguiente
        </Button>
      )}
    </Stack>
  );
}
