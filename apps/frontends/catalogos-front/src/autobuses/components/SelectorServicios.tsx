import {
  DeleteForever,
  Edit,
  Search,
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import {
  EmptyState,
  PaperBlock,
  ServicioIcon,
  type SidebarConfig,
} from "@nexoroute/commons";
import React from "react";
import ServicioExterno from "../../servicios/types/ServicioExterno";
import Add from "@mui/icons-material/Add";
import AutobusServicio from "../types/AutobusServicio";
import AutobusServicioForm from "./AutobusServicioForm";
import useAutobusServicios from "../hooks/useAutobusServicios";

type Props = {
  fullList: ServicioExterno[];
  existingServices: ServicioExterno[];
  selectedServices?: Pick<
    AutobusServicio,
    "servicioId" | "configuracion_servicio"
  >[];
  openSidebar: (config: SidebarConfig) => void;
  closeSidebar?: () => void;
  updateList: (
    services: Pick<
      AutobusServicio,
      "servicioId" | "configuracion_servicio"
    >[],
  ) => void;
};

export default function SelectorServicios({
  existingServices,
  selectedServices = [],
  openSidebar,
  closeSidebar,
  updateList,
  fullList,
}: Readonly<Props>) {
  const [query, setQuery] = React.useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const unselectedServices = React.useMemo(
    () =>
      existingServices.filter(
        (servicio) =>
          !selectedServices.some(
            (selected) =>
              selected.servicioId === servicio.id,
          ) &&
          (normalizedQuery
            ? servicio.nombre
                .toLowerCase()
                .includes(normalizedQuery)
            : true),
      ),
    [existingServices, selectedServices, normalizedQuery],
  );

  const { add, update, remove, find } = useAutobusServicios(
    {
      servicios: fullList,
      selected: selectedServices,
      updateList,
    },
  );

  const [pickedService, setPickedService] =
    React.useState<ServicioExterno | null>(null);

  const [pickedBusService, setPickedBusService] =
    React.useState<ServicioExterno | null>(null);

  return (
    <PaperBlock
      title="Servicios disponibles"
      subtitle="Selecciona los servicios que ofrece esta unidad, selecciona al menos uno."
      contentWrapperSx={{
        display: "flex",
        gap: "12px",
        "@media (max-width: 640px)": {
          flexDirection: "column",
        },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <TextField
          label="Buscar servicio"
          variant="outlined"
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <IconButton
                  aria-label="Buscar servicio"
                  size="small"
                  onClick={() => setQuery("")}
                >
                  <Search />
                </IconButton>
              ),
            },
          }}
          fullWidth
        />
        <Box
          sx={{
            maxHeight: 320,
            overflowY: "auto",
            flex: 1,
          }}
        >
          {unselectedServices.length === 0 ? (
            <EmptyState
              variant="no-results"
              title={
                normalizedQuery
                  ? "No se encontraron servicios"
                  : "No hay servicios disponibles"
              }
            />
          ) : (
            unselectedServices.map((servicio) => (
              <ListItem
                key={servicio.id}
                sx={(theme) => ({
                  backgroundColor:
                    pickedService?.id === servicio.id
                      ? theme.palette.action.selected
                      : "inherit",
                })}
                secondaryAction={
                  <IconButton
                    disabled={selectedServices.length >= 12}
                    edge="end"
                    aria-label="add_service"
                    color={
                      selectedServices.length >= 12
                        ? "inherit"
                        : "primary"
                    }
                    onClick={() => {
                      setPickedService(servicio);
                      openSidebar({
                        title: `Agregar servicio: ${servicio.nombre.toLocaleLowerCase()}`,
                        children: (
                          <AutobusServicioForm
                            key={servicio.id}
                            propiedades={
                              servicio.propiedades
                            }
                            id_servicio={servicio.id ?? 0}
                            agregarServicio={(
                              newService,
                            ) => {
                              add(newService);
                              setPickedService(null);
                              closeSidebar?.();
                            }}
                          />
                        ),
                        onCloseSidebar: () =>
                          setPickedService(null),
                      });
                    }}
                  >
                    <Add />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <ServicioIcon
                    name={servicio.icono_nombre}
                  />
                </ListItemIcon>
                <ListItemText>
                  {servicio.nombre}
                </ListItemText>
              </ListItem>
            ))
          )}
        </Box>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" gutterBottom>
          {selectedServices.length} servicios seleccionados
        </Typography>
        {selectedServices.length === 0 ? (
          <EmptyState
            variant="no-results"
            title="No hay servicios agregados"
          />
        ) : (
          selectedServices.map((servicio, index) => {
            const info = find(servicio.servicioId);
            return (
              <ListItem
                key={servicio.servicioId ?? index + 1}
                sx={(theme) => ({
                  backgroundColor:
                    pickedBusService?.id ===
                    servicio.servicioId
                      ? theme.palette.action.selected
                      : "inherit",
                })}
                secondaryAction={
                  <>
                    <IconButton
                      aria-label="edit_service"
                      onClick={() => {
                        setPickedBusService(info ?? null);
                        openSidebar({
                          title: `Editar servicio: ${(info?.nombre ?? "").toLocaleLowerCase()}`,
                          children: (
                            <AutobusServicioForm
                              key={servicio.servicioId}
                              propiedades={
                                info?.propiedades ?? []
                              }
                              id_servicio={
                                servicio.servicioId ?? 0
                              }
                              existingProperties={
                                servicio.configuracion_servicio
                              }
                              agregarServicio={(
                                updatedService,
                              ) => {
                                update(updatedService);
                                closeSidebar?.();
                              }}
                            />
                          ),
                          onCloseSidebar: () =>
                            setPickedBusService(null),
                        });
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      aria-label="remove_service"
                      onClick={() =>
                        remove(servicio.servicioId ?? 0)
                      }
                    >
                      <DeleteForever />
                    </IconButton>
                  </>
                }
              >
                <ListItemIcon>
                  <ServicioIcon
                    name={info?.icono_nombre ?? "default"}
                  />
                </ListItemIcon>
                <ListItemText>
                  {info?.nombre ?? "Servicio no encontrado"}
                </ListItemText>
              </ListItem>
            );
          })
        )}
      </Box>
      {selectedServices.length >= 12 && (
        <Typography variant="caption" color="error">
          Se ha alcanzado el límite máximo de 12 servicios
          seleccionados. Para agregar más, elimine uno de
          los servicios existentes.
        </Typography>
      )}
    </PaperBlock>
  );
}
