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

  const isValid = React.useMemo(() => {
    return propiedades.every((campo) => {
      const isVisible = campo.visible
        ? properties[campo.visible.campo] ===
          campo.visible.valor
        : true;

      if (!isVisible) return true; // oculto: no bloquea
      if (!campo.requerido) return true; // opcional: no bloquea

      const value = properties[campo.clave];
      return (
        value !== null &&
        value !== undefined &&
        value !== ""
      );
    });
  }, [propiedades, properties]);

  const sanitizeProperties = (
    props: Record<string, unknown>,
  ): Record<string, unknown> => {
    return Object.fromEntries(
      Object.entries(props).filter(
        ([, value]) =>
          value !== null &&
          value !== undefined &&
          value !== "",
      ),
    );
  };

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
        disabled={!isValid}
        onClick={() =>
          agregarServicio({
            servicioId: id_servicio,
            configuracion_servicio:
              sanitizeProperties(properties),
          })
        }
      >
        Guardar
      </Button>
    </Box>
  );
}
