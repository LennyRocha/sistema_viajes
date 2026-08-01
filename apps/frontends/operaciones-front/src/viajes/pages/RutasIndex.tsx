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
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import RouteIcon from "@mui/icons-material/Route";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Pagination,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import GoogleRouteMap from "../components/GoogleRouteMap";
import RutaDesigner from "../components/RutaDesigner";
import { getRutasPage, toggleRutaStatus } from "../api/operacionesHttp";
import {
  CatalogSortOption,
  CatalogStatusFilter,
} from "../types/OperacionesApi";
import RutaBase from "../types/RutaBase";
import { mapRutaApi } from "../utils/apiMappers";

interface Props extends CommonPageProps {}

const STATUS_OPTIONS: Array<{ value: CatalogStatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

const SORT_OPTIONS: Array<{ value: CatalogSortOption; label: string }> = [
  { value: "recent", label: "Mas recientes" },
  { value: "oldest", label: "Mas antiguos" },
  { value: "name_asc", label: "Nombre A-Z" },
  { value: "name_desc", label: "Nombre Z-A" },
];

export default function RutasIndex({ snack, showDialog }: Readonly<Props>) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] =
    React.useState<CatalogStatusFilter>("all");
  const [sortOption, setSortOption] =
    React.useState<CatalogSortOption>("recent");
  const [page, setPage] = React.useState(1);
  const [pageData, setPageData] = React.useState({ total: 0, totalPages: 1 });
  const [routes, setRoutes] = React.useState<RutaBase[]>([]);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [routeModalOpen, setRouteModalOpen] = React.useState(false);
  const [editingRoute, setEditingRoute] = React.useState<RutaBase | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = React.useState<number | null>(null);

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
        status: statusFilter,
        sort: sortOption,
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
  }, [page, search, sortOption, statusFilter]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadRoutes();
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [loadRoutes]);

  const handleToggleStatus = React.useCallback(
    async (routeId: number) => {
      setStatusUpdatingId(routeId);
      try {
        const updated = await toggleRutaStatus(routeId);
        snack?.success?.({
          message: `Ruta ${updated.estatus ? "activada" : "desactivada"}`,
        });
        await loadRoutes();
      } catch (error) {
        snack?.error?.({
          message:
            error instanceof Error
              ? `No se pudo cambiar el estatus: ${error.message}`
              : "No se pudo cambiar el estatus",
        });
      } finally {
        setStatusUpdatingId(null);
      }
    },
    [loadRoutes, snack],
  );
  const openStatusDialog = React.useCallback(
    (route: RutaBase) => {
      if (!showDialog) {
        void handleToggleStatus(route.id);
        return;
      }

      const nextStatusLabel = route.estatus ? "inactiva" : "activa";
      showDialog({
        title: "Confirmar cambio de estatus",
        content: (
          <Stack spacing={1.5} sx={{ minWidth: { sm: 360 } }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 900 }}>
                {route.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vas a cambiar esta ruta a estado {nextStatusLabel}.
              </Typography>
            </Box>
          </Stack>
        ),
        confirmText: route.estatus ? "Desactivar" : "Activar",
        cancelText: "Cancelar",
        showCancelButton: true,
        showCloseButton: true,
        closeDialogOnBackdropClick: true,
        submitOnEnter: true,
        onConfirm: async () => {
          await handleToggleStatus(route.id);
        },
        onClose: () => {},
      });
    },
    [handleToggleStatus, showDialog],
  );

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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1fr) 420px" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <PaperBlock
          title="Rutas guardadas"
          subtitle="Busca, ordena, filtra y selecciona una ruta para revisar su recorrido"
          contentMaxHeight={760}
          paperProps={{
            sx: {
              order: { xs: 2, xl: 2 },
            },
          }}
          contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1 }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 170px 190px" },
              gap: 1,
            }}
          >
            <Stack spacing={0.55}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, fontWeight: 800 }}>
                Buscar
              </Typography>
              <TextField
                placeholder="Buscar ruta"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                size="small"
                fullWidth
              />
            </Stack>
            <Stack spacing={0.55}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, fontWeight: 800 }}>
                Estatus
              </Typography>
              <TextField
                select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as CatalogStatusFilter);
                  setPage(1);
                }}
                size="small"
                fullWidth
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack spacing={0.55}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, fontWeight: 800 }}>
                Ordenar
              </Typography>
              <TextField
                select
                value={sortOption}
                onChange={(event) => {
                  setSortOption(event.target.value as CatalogSortOption);
                  setPage(1);
                }}
                size="small"
                fullWidth
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Box>

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
            <Alert severity="info">
              {search.trim() || statusFilter !== "all"
                ? "No hubo coincidencias para los filtros actuales."
                : "Todavia no hay rutas para mostrar."}
            </Alert>
          ) : (
            routes.map((route, index) => (
              <Box
                key={route.id}
                component="button"
                onClick={() => setSelectedId(route.id)}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  p: 0,
                  overflow: "hidden",
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
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) 64px",
                    minHeight: 96,
                  }}
                >
                  <Box sx={{ p: 1.25 }}>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                      <Chip label={`R${index + 1}`} color="primary" size="small" />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
                          <Typography sx={{ fontWeight: 900 }}>{route.nombre}</Typography>
                          <Chip
                            label={route.estatus ? "Activo" : "Inactivo"}
                            color={route.estatus ? "success" : "default"}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
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
                  <Stack
                    spacing={0.25}
                    sx={{
                      p: 0.5,
                      justifyContent: "center",
                      alignItems: "center",
                      borderLeft: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "rgba(255,255,255,0.62)",
                    }}
                  >
                    <Tooltip title="Editar ruta">
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditingRoute(route);
                          setRouteModalOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={route.estatus ? "Desactivar ruta" : "Activar ruta"}>
                      <Box
                        onClick={(event) => event.stopPropagation()}
                        sx={{ display: "flex", justifyContent: "center" }}
                      >
                        <Switch
                          color="success"
                          checked={Boolean(route.estatus)}
                          disabled={statusUpdatingId === route.id}
                          onChange={() => openStatusDialog(route)}
                        />
                      </Box>
                    </Tooltip>
                  </Stack>
                </Box>
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
            onClick={() => {
              setEditingRoute(null);
              setRouteModalOpen(true);
            }}
          >
            Nueva ruta
          </Button>
        </PaperBlock>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, order: { xs: 1, xl: 1 } }}>
          <PaperBlock
            title={selectedRoute?.nombre || "Selecciona una ruta"}
            subtitle="El boton Simular mueve un autobus sobre el recorrido guardado"
            paperProps={{ sx: { p: 0, overflow: "hidden" } }}
            contentWrapperSx={{ p: 0 }}
          >
            <GoogleRouteMap
              key={`route-map-${selectedRoute?.id ?? "empty"}`}
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

      <Dialog
        open={routeModalOpen}
        onClose={() => {
          setRouteModalOpen(false);
          setEditingRoute(null);
        }}
        fullWidth
        maxWidth="xl"
        slotProps={{
          paper: {
            sx: {
              height: "calc(100vh - 48px)",
              borderRadius: "8px",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 950 }}>
              {editingRoute ? "Editar ruta reutilizable" : "Crear ruta reutilizable"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Define origen, destino, paradas y trazo operativo.
            </Typography>
          </Box>
          <IconButton
            onClick={() => {
              setRouteModalOpen(false);
              setEditingRoute(null);
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2, overflow: "auto" }}>
          <RutaDesigner
            initialRoute={editingRoute}
            routeId={editingRoute?.id ?? null}
            snack={snack}
            onSaved={async () => {
              await loadRoutes();
              setRouteModalOpen(false);
              setEditingRoute(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
