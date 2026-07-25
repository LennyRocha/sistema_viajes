import React from "react";
import CampoConfig from "../../servicios/types/CampoServicio";
import CampoField from "./CampoField";
import { Box, Button } from "@mui/material";
import AutobusServicio from "../types/AutobusServicio";

type Props = {
  propiedades: CampoConfig[];
  id_servicio: number;
  agregarServicio: (
    servicio: Pick<
      AutobusServicio,
      "servicioId" | "configuracion_servicio"
    >,
  ) => void;
  existingProperties?: Record<string, unknown>;
};

export default function AutobusServicioForm({
  propiedades,
  id_servicio,
  agregarServicio,
  existingProperties = {},
}: Readonly<Props>) {
  const [properties, setProperties] = React.useState<
    Record<string, unknown>
  >({});

  const addProperty = React.useCallback(
    (clave: string, valor: string | number | boolean) => {
      setProperties((prev) => ({
        ...prev,
        [clave]: valor,
      }));
    },
    [],
  );

  const removeProperty = React.useCallback(
    (clave: string) => {
      setProperties((prev) => {
        const newProperties = { ...prev };
        delete newProperties[clave];
        return newProperties;
      });
    },
    [],
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {propiedades.map((campo) => (
        <CampoField
          key={campo.clave}
          campo={campo}
          properties={properties}
          addProperty={addProperty}
          removeProperty={removeProperty}
          existingProperties={existingProperties}
        />
      ))}
      <Button
        variant="outlined"
        size="small"
        fullWidth
        disabled={
          Object.keys(properties).length === 0 ||
          Object.keys(properties).length !==
            propiedades.length ||
          Object.entries(properties).some(
            ([key, value]) => {
              return (
                value === null ||
                value === undefined ||
                value === ""
              );
            },
          )
        }
        onClick={() =>
          agregarServicio({
            servicioId: id_servicio,
            configuracion_servicio: properties,
          })
        }
      >
        Guardar
      </Button>
    </Box>
  );
}
