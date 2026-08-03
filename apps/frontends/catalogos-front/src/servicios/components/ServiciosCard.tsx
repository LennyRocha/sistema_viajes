"use client";
import {
  Alert,
  CircularProgress,
  Grid,
  Typography,
  alpha,
  Box,
} from "@mui/material";
import React from "react";
import {
  CenteredDiv,
  ServicioIcon,
} from "@nexoroute/commons";
import { useGetServiciosQuery } from "../api/serviciosApi";

export default function ServiciosCard({
  disabledFunction,
}: Readonly<{
  disabledFunction: (disabled: boolean) => void;
}>) {
  const query = useGetServiciosQuery({
    active: true,
  });
  React.useEffect(() => {
    if (query.data) {
      disabledFunction(query.data.length === 0);
    }
  }, [query.data, disabledFunction]);
  if (query.isLoading) {
    return (
      <CenteredDiv>
        <CircularProgress />
      </CenteredDiv>
    );
  }
  if (query.isError) {
    return (
      <Alert severity="error">
        Error al cargar los servicios
      </Alert>
    );
  }
  if (query.data?.length === 0) {
    return (
      <Alert severity="info">
        No hay servicios disponibles
      </Alert>
    );
  }
  return (
    <Grid container spacing={2}>
      {query.data?.map((servicio) => (
        <Grid
          size={{ xs: 6, sm: 4, lg: 3 }}
          key={servicio.id}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Box
              sx={(theme) => ({
                backgroundColor: alpha(
                  theme.palette.accent.main,
                  0.5,
                ),
                padding: "8px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white ",
              })}
            >
              <ServicioIcon
                name={servicio.icono_nombre}
                size="sm"
              />
            </Box>
            <Typography
              variant="body2"
              color="textSecondary"
            >
              {servicio.nombre}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
