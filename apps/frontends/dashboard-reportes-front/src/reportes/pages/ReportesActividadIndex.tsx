"use client";

import React from "react";
import {
  Breadcrumb,
  CommonPageProps,
  PaperBlock,
  PaperHeader,
} from "@nexoroute/commons";
import {
  BlockOutlined,
  CheckCircleOutlined,
  ErrorOutlined,
  FilterAltOff,
  ListAlt,
  Refresh,
  Search,
  Visibility,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { getActividadReporte } from "../api/reportesApi";
import type {
  ActividadReporte,
  ActividadReporteFilters,
  ActividadReporteResponse,
  ResultadoActividad,
} from "../types/ActividadReporte";

interface Props extends CommonPageProps {}

const EMPTY_FILTERS: ActividadReporteFilters = {
  search: "",
  categoria: "",
  resultado: "",
  desde: "",
  hasta: "",
};

const EMPTY_DATA: ActividadReporteResponse = {
  items: [],
  pagination: { page: 1, pageSize: 25, total: 0, totalPages: 1 },
  summary: { total: 0, exitos: 0, fallos: 0, denegados: 0 },
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));

const readable = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const resultColor = (result: ResultadoActividad) => {
  if (result === "EXITO") return "success";
  if (result === "FALLO") return "error";
  return "warning";
};

export default function ReportesActividadIndex({
  openSidebar,
}: Readonly<Props>) {
  const [draftFilters, setDraftFilters] =
    React.useState<ActividadReporteFilters>(EMPTY_FILTERS);
  const [filters, setFilters] =
    React.useState<ActividadReporteFilters>(EMPTY_FILTERS);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [data, setData] = React.useState(EMPTY_DATA);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    getActividadReporte({ page, pageSize, filters, signal: controller.signal })
      .then(setData)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No se pudo cargar el reporte de actividad",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [filters, page, pageSize, refreshKey]);

  const updateFilter = (key: keyof ActividadReporteFilters, value: string) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = () => {
    setPage(1);
    setFilters({ ...draftFilters });
    setRefreshKey((current) => current + 1);
  };

  const clearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setPage(1);
    setRefreshKey((current) => current + 1);
  };

  const showDetails = (item: ActividadReporte) => {
    openSidebar({
      title: "Detalle de actividad",
      children: <ActivityDetails item={item} />,
    });
  };

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          {
            nombre: "Bitácora",
            href: "/dashboard/reports",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Bitácora"
        subtitle="Actividad de autenticación, seguridad y operaciones administrativas"
        iconname="assessment"
        showButton
        buttonTitle="Actualizar"
        leftIcon={<Refresh />}
        onButtonClick={() => setRefreshKey((current) => current + 1)}
        isLoading={loading}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
          my: 1.5,
        }}
      >
        <Metric label="Total" value={data.summary.total} icon={<ListAlt />} />
        <Metric
          label="Exitosos"
          value={data.summary.exitos}
          icon={<CheckCircleOutlined />}
          color="success.main"
        />
        <Metric
          label="Fallidos"
          value={data.summary.fallos}
          icon={<ErrorOutlined />}
          color="error.main"
        />
        <Metric
          label="Denegados"
          value={data.summary.denegados}
          icon={<BlockOutlined />}
          color="warning.main"
        />
      </Box>

      <PaperBlock title="Filtros" subtitle="Acota la actividad por usuario, evento o fecha">
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            applyFilters();
          }}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "minmax(220px, 2fr) repeat(4, minmax(135px, 1fr)) auto",
            },
            gap: 1.25,
            alignItems: "center",
            pt: 0.5,
          }}
        >
          <TextField
            size="small"
            label="Buscar"
            placeholder="Correo, evento, ruta o IP"
            value={draftFilters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
          />
          <TextField
            select
            size="small"
            label="Categoría"
            value={draftFilters.categoria}
            onChange={(event) => updateFilter("categoria", event.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="AUTENTICACION">Autenticación</MenuItem>
            <MenuItem value="SEGURIDAD">Seguridad</MenuItem>
            <MenuItem value="OPERACION">Operación</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Resultado"
            value={draftFilters.resultado}
            onChange={(event) => updateFilter("resultado", event.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="EXITO">Exitoso</MenuItem>
            <MenuItem value="FALLO">Fallido</MenuItem>
            <MenuItem value="DENEGADO">Denegado</MenuItem>
          </TextField>
          <TextField
            size="small"
            type="date"
            label="Desde"
            value={draftFilters.desde}
            onChange={(event) => updateFilter("desde", event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            type="date"
            label="Hasta"
            value={draftFilters.hasta}
            onChange={(event) => updateFilter("hasta", event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
            <Tooltip title="Limpiar filtros">
              <IconButton aria-label="Limpiar filtros" onClick={clearFilters}>
                <FilterAltOff />
              </IconButton>
            </Tooltip>
            <Button type="submit" variant="contained" startIcon={<Search />}>
              Buscar
            </Button>
          </Stack>
        </Box>
      </PaperBlock>

      <Box sx={{ mt: 1.5 }}>
        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => setRefreshKey((n) => n + 1)}>
                Reintentar
              </Button>
            }
            sx={{ mb: 1.5 }}
          >
            {error}
          </Alert>
        )}
        <PaperBlock
          title="Actividad registrada"
          subtitle={`${data.pagination.total} evento(s) encontrado(s)`}
          contentWrapperSx={{ overflowX: "auto" }}
        >
          <TableContainer>
            <Table size="small" sx={{ minWidth: 880 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Evento</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Módulo</TableCell>
                  <TableCell>Resultado</TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>IP</TableCell>
                  <TableCell align="center">Detalle</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? Array.from({ length: 6 }, (_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={7}>
                          <Skeleton height={34} />
                        </TableCell>
                      </TableRow>
                    ))
                  : data.items.map((item) => (
                      <TableRow hover key={item.id}>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(item.fecha)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {readable(item.evento)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.accion}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{item.email || "No identificado"}</Typography>
                          {item.roles?.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              {item.roles.map((role) => role.replace("ROLE_", "")).join(", ")}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{readable(item.modulo)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            variant="outlined"
                            color={resultColor(item.resultado)}
                            label={readable(item.resultado)}
                          />
                        </TableCell>
                        <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                          {item.ip || "-"}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver detalle">
                            <IconButton
                              size="small"
                              aria-label={`Ver detalle del evento ${item.id}`}
                              onClick={() => showDetails(item)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                {!loading && data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        No hay actividad que coincida con los filtros.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={data.pagination.total}
            page={Math.max(0, page - 1)}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[10, 25, 50]}
            onPageChange={(_, nextPage) => setPage(nextPage + 1)}
            onRowsPerPageChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            labelRowsPerPage="Filas por página"
          />
        </PaperBlock>
      </Box>
    </>
  );
}

function Metric({
  label,
  value,
  icon,
  color = "primary.main",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: 1.25,
      }}
    >
      <Box sx={{ color, display: "flex" }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

function ActivityDetails({ item }: { item: ActividadReporte }) {
  const fields = [
    ["Fecha", formatDate(item.fecha)],
    ["Evento", readable(item.evento)],
    ["Acción", item.accion],
    ["Categoría", readable(item.categoria)],
    ["Módulo", readable(item.modulo)],
    ["Resultado", readable(item.resultado)],
    ["Usuario", item.email || "No identificado"],
    ["Roles", item.roles?.join(", ") || "-"],
    ["Método y ruta", [item.metodo, item.ruta].filter(Boolean).join(" ") || "-"],
    ["IP", item.ip || "-"],
    ["Mensaje", item.mensaje || "-"],
    ["Request ID", item.requestId || "-"],
  ];

  return (
    <Stack spacing={1.25} sx={{ py: 1 }}>
      {fields.map(([label, value]) => (
        <Box key={label}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
            {value}
          </Typography>
        </Box>
      ))}
      {item.userAgent && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Navegador
          </Typography>
          <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
            {item.userAgent}
          </Typography>
        </Box>
      )}
      {item.detalles && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Datos adicionales
          </Typography>
          <Box
            component="pre"
            sx={{
              m: 0,
              mt: 0.5,
              p: 1,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              fontSize: "0.75rem",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {JSON.stringify(item.detalles, null, 2)}
          </Box>
        </Box>
      )}
    </Stack>
  );
}
