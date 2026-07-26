import React from "react";
import MotionPaper from "../components/MotionPaper";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel,
} from "@mui/x-data-grid";
import {
  Typography,
  Box,
  IconButton,
  Switch,
  Skeleton,
  Grid,
} from "@mui/material";
import { Edit, Delete, Info } from "@mui/icons-material";
import { esES } from "@mui/x-data-grid/locales";

interface Callbacks<T> {
  onEditClick?: (row: T) => void;
  onDeleteClick?: (row: T) => void;
  onToggleActiveClick?: (row: T) => void;
  onInfoClick?: (row: T) => void;
}

interface TablaProps<
  T extends GridValidRowModel,
> extends Callbacks<T> {
  titulo?: string;
  subtitulo?: string;
  columnas: GridColDef<T>[];
  data: T[];
  pageSize?: number;
  page?: number;
  pageSizeOptions?: number[];
  checkboxSelection?: boolean;
  disableSelectionOnClick?: boolean;
  subHeaderComponent?: React.ReactNode | null;
  tableSx?: object;
  paperProps?: React.ComponentProps<typeof MotionPaper>;
  isLoading?: boolean;
}

export default function Tabla<T extends GridValidRowModel>({
  titulo,
  subtitulo,
  columnas,
  data,
  pageSize = 5,
  page = 0,
  pageSizeOptions = [5, 10, 20],
  checkboxSelection = false,
  disableSelectionOnClick = true,
  tableSx = {},
  subHeaderComponent,
  onEditClick,
  onDeleteClick,
  onToggleActiveClick,
  onInfoClick,
  paperProps = {},
  isLoading = false,
}: Readonly<TablaProps<T>>) {
  const paginationModel = React.useMemo(
    () => ({ pageSize, page }),
    [pageSize, page],
  );
  const cols: GridColDef<T>[] = [
    ...columnas,
    optionsColumn<T>({
      onEditClick,
      onDeleteClick,
      onToggleActiveClick,
      onInfoClick,
    }),
  ];
  return (
    <MotionPaper
      sx={{
        padding: "12px",
        height: "fit-content",
        width: "100%",
      }}
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      {...paperProps}
    >
      {titulo && (
        <Typography
          variant="h3"
          sx={{ fontWeight: 600, mb: 0 }}
        >
          {isLoading ? <Skeleton width={80} /> : titulo}
        </Typography>
      )}
      {subtitulo && (
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{ lineHeight: 1.2 }}
        >
          {isLoading ? <Skeleton width={150} /> : subtitulo}
        </Typography>
      )}
      {subHeaderComponent && (
        <Box
          sx={{
            width: "100%",
            overflowX: "auto",
            padding: "8px 0",
          }}
        >
          {isLoading ? (
            <Skeleton variant="rounded" height={40} />
          ) : (
            subHeaderComponent
          )}
        </Box>
      )}
      {isLoading ? (
        <TablaSkeleton />
      ) : (
        <DataGrid
          rows={data}
          columns={cols}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={pageSizeOptions}
          checkboxSelection={checkboxSelection}
          disableRowSelectionOnClick={
            disableSelectionOnClick
          }
          sx={{
            border: "none",
            width: "100%",
            backgroundColor: "transparent",
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
            ...tableSx,
          }}
          autoHeight
          localeText={
            esES.components.MuiDataGrid.defaultProps
              .localeText
          }
        />
      )}
    </MotionPaper>
  );
}

const optionsColumn = <T extends GridValidRowModel>(
  callbacks: Callbacks<T>,
): GridColDef<T> => {
  const label = {
    slotProps: {
      input: { "aria-label": "Cambiar estado" },
    },
  };
  const actionsWidth =
    20 +
    [
      callbacks.onEditClick,
      callbacks.onDeleteClick,
      callbacks.onInfoClick,
      callbacks.onToggleActiveClick,
    ].filter(Boolean).length *
      40;
  return {
    field: "acciones",
    headerName: "Acciones",
    sortable: false,
    disableColumnMenu: true,
    resizable: false,
    width: Math.min(actionsWidth, 220),
    renderCell: (params: GridRenderCellParams<T>) => (
      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
      >
        {callbacks.onEditClick && (
          <IconButton
            onClick={() =>
              callbacks.onEditClick?.(params.row)
            }
            size="small"
          >
            <Edit />
          </IconButton>
        )}

        {callbacks.onDeleteClick && (
          <IconButton
            onClick={() =>
              callbacks.onDeleteClick?.(params.row)
            }
            size="small"
          >
            <Delete />
          </IconButton>
        )}

        {callbacks.onInfoClick && (
          <IconButton
            onClick={() =>
              callbacks.onInfoClick?.(params.row)
            }
            size="small"
          >
            <Info />
          </IconButton>
        )}

        {callbacks.onToggleActiveClick && (
          <Switch
            checked={
              params.row.estatus ?? params.row.estado
            }
            onClick={(e) => e.stopPropagation()}
            onChange={() =>
              callbacks.onToggleActiveClick?.(params.row)
            }
            {...label}
            size="small"
          />
        )}
      </Box>
    ),
  };
};

const FilaGrid = () => {
  return Array.from({ length: 6 }).map((_, index) => (
    <Grid size={2} key={index + 1}>
      <Typography variant="subtitle2">
        <Skeleton />
      </Typography>
    </Grid>
  ));
};

const TablaSkeleton = () => (
  <Box
    sx={{
      display: "flex",
      minHeight: 0,
      width: "100%",
      overflow: "auto",
    }}
  >
    <Grid
      container
      spacing={3.5}
      columnSpacing={2}
      sx={{
        flex: 1,
        minWidth: 750,
        flexShrink: 0,
      }}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid size={2} key={index + 1}>
          <Typography variant="h4">
            <Skeleton width={75} />
          </Typography>
        </Grid>
      ))}
      {Array.from({ length: 5 }).map((_, index) => (
        <FilaGrid key={index + 1} />
      ))}
      <Grid size={2.4}></Grid>
      <Grid size={2.4}></Grid>
      <Grid size={2.4}></Grid>
      <Grid size={2.4}></Grid>
      <Grid size={2.4}>
        <Typography variant="h6">
          <Skeleton />
        </Typography>
      </Grid>
    </Grid>
  </Box>
);
