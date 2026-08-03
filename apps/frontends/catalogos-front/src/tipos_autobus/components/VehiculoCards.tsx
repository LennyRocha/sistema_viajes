"use client";
import { ChevronRight } from "@mui/icons-material";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import React from "react";
import { useGetTiposAutobusQuery } from "../api/tiposAutobusApi";
import Vehiculo3D from "./Vehiculo3D";
import Modelo3DName from "../types/Modelo3DName";
import TipoAutobus from "../types/TipoAutobus";
import { CenteredDiv } from "@nexoroute/commons";

type Props = {
  onClick?: (tipo: Modelo3DName, bus: TipoAutobus) => void;
};

export default function VehiculoCards({
  onClick = () => {},
}: Readonly<Props>) {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useLayoutEffect(() => {
    let mounted = true;
    setIsLoaded(false);

    const timeout = setTimeout(() => {
      if (mounted) setIsLoaded(true);
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);
  const query = useGetTiposAutobusQuery();
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
        Error al cargar los tipos de autobús
      </Alert>
    );
  }
  if (query.data?.length === 0) {
    return (
      <Alert severity="info">
        No pudimos encontrar tipos de autobús disponibles
      </Alert>
    );
  }
  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card variant="outlined">
          <CenteredDiv>
            {isLoaded ? (
              <Vehiculo3D
                tipo="hyundai"
                width={"75%"}
                canRotate
              />
            ) : (
              <CircularProgress
                size="5rem"
                aria-label="Loading model…"
                sx={(theme) => ({
                  color: theme.palette.accent.main,
                })}
              />
            )}
          </CenteredDiv>
          <CardContent>
            <Typography
              gutterBottom
              variant="h6"
              component="div"
            >
              {query.data?.[0].nombre}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              {query.data?.[0].descripcion}
            </Typography>
            <Typography
              variant="caption"
              color="textDisabled"
              sx={{
                fontStyle: "italic",
              }}
            >
              <b>*</b> Modelo representativo, puede variar
              según la unidad adquirida.
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              endIcon={<ChevronRight />}
              onClick={() =>
                onClick(
                  "hyundai",
                  query.data?.[0] ?? ({} as TipoAutobus),
                )
              }
            >
              Ver más
            </Button>
          </CardActions>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card variant="outlined">
          {" "}
          <CenteredDiv>
            {isLoaded ? (
              <Vehiculo3D
                tipo="volkswagen"
                width={"75%"}
                canRotate
              />
            ) : (
              <CircularProgress
                size="5rem"
                aria-label="Loading model…"
                sx={(theme) => ({
                  color: theme.palette.accent.main,
                })}
              />
            )}
          </CenteredDiv>
          <CardContent>
            <Typography
              gutterBottom
              variant="h6"
              component="div"
            >
              {query.data?.[1].nombre}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              {query.data?.[1].descripcion}
            </Typography>
            <Typography
              variant="caption"
              color="textDisabled"
              sx={{
                fontStyle: "italic",
              }}
            >
              <b>*</b> Modelo representativo, puede variar
              según la unidad adquirida.
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              endIcon={<ChevronRight />}
              onClick={() =>
                onClick(
                  "volkswagen",
                  query.data?.[1] ?? ({} as TipoAutobus),
                )
              }
            >
              Ver más
            </Button>
          </CardActions>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card variant="outlined">
          {" "}
          <CenteredDiv>
            {isLoaded ? (
              <Vehiculo3D
                tipo="mercedes"
                width={"75%"}
                canRotate
              />
            ) : (
              <CircularProgress
                size="5rem"
                aria-label="Loading model…"
                sx={(theme) => ({
                  color: theme.palette.accent.main,
                })}
              />
            )}
          </CenteredDiv>
          <CardContent>
            <Typography
              gutterBottom
              variant="h6"
              component="div"
            >
              {query.data?.[2].nombre}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              {query.data?.[2].descripcion}
            </Typography>
            <Typography
              variant="caption"
              color="textDisabled"
              sx={{
                fontStyle: "italic",
              }}
            >
              <b>*</b> Modelo representativo, puede variar
              según la unidad adquirida.
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              endIcon={<ChevronRight />}
              onClick={() =>
                onClick(
                  "mercedes",
                  query.data?.[2] ?? ({} as TipoAutobus),
                )
              }
            >
              Ver más
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
}
