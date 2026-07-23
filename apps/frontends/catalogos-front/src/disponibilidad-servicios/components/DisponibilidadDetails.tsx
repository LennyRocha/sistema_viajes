import React from "react";
import { DisponibilidadPorServicio } from "../types/disponibilidad-responses";
import { DisponibilidadServicioResponse } from "../types/disponibilidad-and";
import TipoAutobus from "../../tipos_autobus/types/TipoAutobus";
import { SnackFunctionProps } from "@nexoroute/commons";
import {
  Box,
  IconButton,
  Switch,
  Typography,
} from "@mui/material";
import Add from "@mui/icons-material/Add";
import { DisponibilidadServicioInput } from "../types/disponibilidad-input";
import onSubmit from "../forms/onNewDisponibilidadSubmit";
import onChangeStatus from "../forms/onChangeStatusSubmit";

type Props = {
  row: DisponibilidadPorServicio & {
    ids: DisponibilidadServicioResponse[];
  };
  tiposBus: TipoAutobus[];
  snack?: SnackFunctionProps;
  closeSidebar?: () => void;
  refetch: () => void;
  submitMutate: (args: DisponibilidadServicioInput) => {
    unwrap: () => Promise<unknown>;
  };
  changeStatusMutate: (args: { id: number }) => {
    unwrap: () => Promise<unknown>;
  };
  servicio_nombre: string;
  servicio_id: number;
  isLoading: boolean;
};

const DisponibilidadDetails = ({
  row,
  tiposBus,
  snack,
  refetch,
  closeSidebar,
  submitMutate,
  changeStatusMutate,
  servicio_nombre,
  servicio_id,
  isLoading,
}: Readonly<Props>) => {
  const doSubmit = async (data) => {
    return await onSubmit(
      data,
      servicio_nombre,
      row.institucion.nombre,
      {
        snack,
        mutate: submitMutate,
        closeSidebar,
        refetch,
      },
    );
  };
  const doChange = async (id: number, activo: boolean) => {
    return await onChangeStatus(id, activo, {
      snack,
      mutate: changeStatusMutate as any,
      closeSidebar,
      refetch,
    });
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {tiposBus.map((tipo) => {
        const disponibilidad = row.ids.find(
          (d) => d.linea === tipo.linea,
        );

        return (
          <Box key={tipo.id}>
            <Typography>{tipo.nombre}</Typography>

            {disponibilidad ? (
              <Switch
                checked={disponibilidad.activo}
                onChange={(e) =>
                  doChange(
                    disponibilidad.id,
                    e.target.checked,
                  )
                }
                disabled={isLoading}
              />
            ) : (
              <IconButton
                onClick={() =>
                  doSubmit({
                    servicioId: servicio_id,
                    tipoId: tipo.id,
                    institucionId: row.institucion.id,
                  })
                }
                loading={isLoading}
              >
                <Add />
              </IconButton>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
export default DisponibilidadDetails;
