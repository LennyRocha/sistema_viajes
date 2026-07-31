"use client";

import React from "react";
import {
  Breadcrumb,
  CommonPageProps,
  PaperBlock,
  PaperHeader,
} from "@nexoroute/commons";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import AddIcon from "@mui/icons-material/Add";
import RouteIcon from "@mui/icons-material/Route";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Pagination,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import GoogleRouteMap from "../components/GoogleRouteMap";
import RutaDesigner from "../components/RutaDesigner";
import { getRutasPage } from "../api/operacionesHttp";
import RutaBase from "../types/RutaBase";
import { mapRutaApi } from "../utils/apiMappers";

interface Props extends CommonPageProps {}

export default function RutasIndex({ snack }: Readonly<Props>) {
  const [tab, setTab] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageData, setPageData] = React.useState({ total: 0, totalPages: 1 });
  const [routes, setRoutes] = React.useState<RutaBase[]>([]);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const selectedRoute = routes.find((route) => route.id === selectedId) || routes[0] || null;

  const loadRoutes = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await getRutasPage({
        page,
        limit: 6,
        search,
        active: false,
      });
      const mapped = response.data.map(mapRutaApi);
      setRoutes(mapped);
      setPageData({ total: response.total, totalPages: response.totalPages });
      setSelectedId((current) =>
        current && mapped.some((route) => route.id === current)
          ? current
          : mapped[0]?.id || null,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las rutas",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadRoutes();
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [loadRoutes]);

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[{ nombre: "Rutas", href: "/dashboard/routes", disabled: true }]}
      />
      <PaperHeader
        title="Rutas"
        subtitle="Trayectos reutilizables con origen, destino, paradas y simulacion operativa"
        iconname="route"
      />

      <PaperBlock paperProps={{ sx: { p: 0 } }} contentWrapperSx={{ p: 0 }}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{ px: 2, borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Tab label="Rutas guardadas" />
          <Tab label="Crear ruta reutilizable" />
        </Tabs>
      </PaperBlock>

      {tab === 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "420px minmax(0, 1fr)" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <PaperBlock
            title="Rutas guardadas"
            subtitle="Busca y selecciona una ruta para ver su recorrido"
            contentMaxHeight={760}
            contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            <TextField
              label="Buscar ruta"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              size="small"
              fullWidth
            />
            <Typography variant="caption" color="text.secondary">
              {isLoading ? "Buscando rutas..." : `${pageData.total} ruta(s) encontradas`}
            </Typography>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            {isLoading && routes.length === 0 ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Cargando rutas...</Typography>
              </Stack>
            ) : routes.length === 0 ? (
              <Alert severity="info">Todavia no hay rutas para mostrar.</Alert>
            ) : (
              routes.map((route, index) => (
                <Box
                  key={route.id}
                  component="button"
                  onClick={() => setSelectedId(route.id)}
                  sx={{
                    width: "100%",
                    textAlign: "left",
                    p: 1.25,
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: selectedRoute?.id === route.id ? "primary.main" : "divider",
                    backgroundColor:
                      selectedRoute?.id === route.id
                        ? "rgba(31, 97, 141, 0.07)"
                        : "background.paper",
                    cursor: "pointer",
                  }}
                >
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                    <Chip label={`R${index + 1}`} color="primary" size="small" />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 900 }}>{route.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {route.origen.direccion} a {route.destino.direccion}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 0.75 }}>
                        <Chip label={`${route.distanciaKm || "-"} km`} size="small" />
                        <Chip label={`${route.duracionMin || "-"} min`} size="small" />
                        <Chip label={`${route.paradas.length} parada(s)`} size="small" />
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              ))
            )}
            {pageData.totalPages > 1 && (
              <Pagination
                count={pageData.totalPages}
                page={page}
                onChange={(_, nextPage) => setPage(nextPage)}
                color="primary"
                size="small"
              />
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setTab(1)}
            >
              Nueva ruta
            </Button>
          </PaperBlock>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <PaperBlock
              title={selectedRoute?.nombre || "Selecciona una ruta"}
              subtitle="El boton Simular mueve un autobus sobre el recorrido guardado"
              paperProps={{ sx: { p: 0, overflow: "hidden" } }}
              contentWrapperSx={{ p: 0 }}
            >
              <GoogleRouteMap
                routes={selectedRoute ? [selectedRoute] : []}
                height={640}
                title={selectedRoute ? "Ruta seleccionada" : "Sin ruta seleccionada"}
                enableStreetView
                enableSimulation
                simulationRoute={selectedRoute}
              />
            </PaperBlock>
            <PaperBlock
              title="Resumen de ruta"
              contentWrapperSx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
            >
              <Chip icon={<RouteIcon />} label={`${selectedRoute?.distanciaKm || "-"} km`} />
              <Chip label={`${selectedRoute?.duracionMin || "-"} min`} />
              <Chip label={`${selectedRoute?.paradas.length || 0} parada(s)`} />
              <Chip
                icon={<AltRouteIcon />}
                label={selectedRoute?.waypoints?.length ? "Trazo personalizado" : "Trazo por puntos"}
              />
            </PaperBlock>
          </Box>
        </Box>
      )}

      {tab === 1 && (
        <RutaDesigner
          snack={snack}
          onSaved={async () => {
            await loadRoutes();
            setTab(0);
          }}
        />
      )}
    </>
  );
}
