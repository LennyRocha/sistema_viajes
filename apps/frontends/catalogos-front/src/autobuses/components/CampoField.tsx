import React from "react";
import CampoConfig from "../../servicios/types/CampoServicio";
import {
  Checkbox,
  Divider,
  FormControlLabel,
  MenuItem,
  TextField,
} from "@mui/material";
import { motion } from "framer-motion";

type Props = {
  campo: CampoConfig;
  properties: Record<string, unknown>;
  addProperty: (
    clave: string,
    valor: string | number | boolean,
  ) => void;
  removeProperty: (clave: string) => void;
  existingProperties?: Record<string, unknown>;
};

export default function CampoField({
  campo,
  properties,
  addProperty,
  removeProperty,
  existingProperties = {},
}: Readonly<Props>) {
  const label = {
    slotProps: { input: { "aria-label": campo.clave } },
  };
  const [visible, setVisible] = React.useState(true);
  React.useEffect(() => {
    if (campo.visible) {
      const { campo: campoVisible, valor } = campo.visible;
      const shouldBeVisible =
        properties[campoVisible] !== valor;
      setVisible(shouldBeVisible);

      if (!shouldBeVisible) {
        if (properties[campo.clave] !== undefined) {
          removeProperty(campo.clave);
        }
        return;
      }
    }
    if (properties[campo.clave] === undefined) {
      addProperty(
        campo.clave,
        existingProperties[campo.clave] ??
          campo.defaultValue ??
          campo.opciones?.[0] ??
          ("" as any),
      );
    }
  }, [
    campo,
    properties,
    addProperty,
    removeProperty,
    existingProperties,
  ]);
  const [checked, setChecked] = React.useState(
    (properties[campo.clave] as boolean) ??
      (campo.defaultValue as boolean) ??
      (existingProperties[campo.clave] as boolean) ??
      false,
  );
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.95,
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      style={{ display: visible ? "block" : "none" }}
    >
      {campo.tipo === "boolean" ? (
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={(e) => {
                setChecked(e.target.checked);
                addProperty(campo.clave, e.target.checked);
              }}
              required={campo.requerido ?? false}
              {...label}
              size="small"
            />
          }
          label={campo.label}
        />
      ) : (
        <SelectOrField
          campo={campo}
          properties={properties}
          addProperty={addProperty}
          removeProperty={removeProperty}
          existingProperties={existingProperties}
        />
      )}
      <Divider sx={{ my: 1 }} />
    </motion.div>
  );
}

const SelectOrField = ({
  campo,
  properties,
  addProperty,
  removeProperty,
  existingProperties = {},
}: Readonly<Props>) => {
  const htmlInput =
    campo.tipo === "number"
      ? {
          min: campo.min,
          max: campo.max,
        }
      : {
          maxLength: campo.maxLength,
          minLength: campo.minLength,
          pattern: campo.regex,
        };
  if (campo.opciones) {
    return (
      <TextField
        label={campo.label}
        key={campo.clave}
        select
        value={
          properties[campo.clave] ??
          existingProperties[campo.clave] ??
          campo.defaultValue ??
          campo.opciones[0]
        }
        placeholder={campo.placeholder}
        required={campo.requerido}
        onChange={(e) =>
          campo.tipo === "number"
            ? addProperty(
                campo.clave,
                Number(e.target.value),
              )
            : addProperty(
                campo.clave,
                e.target.value.trim(),
              )
        }
        fullWidth
        sx={{ mt: "8px" }}
        size="small"
      >
        {campo.opciones.map((opcion) => (
          <MenuItem key={opcion} value={opcion}>
            {opcion}
          </MenuItem>
        ))}
      </TextField>
    );
  } else {
    return (
      <TextField
        label={campo.label}
        key={campo.clave}
        type={campo.tipo === "number" ? "number" : "text"}
        value={
          properties[campo.clave] ??
          existingProperties[campo.clave] ??
          campo.defaultValue ??
          ""
        }
        placeholder={campo.placeholder}
        required={campo.requerido}
        slotProps={{ htmlInput }}
        onChange={(e) =>
          campo.tipo === "number"
            ? addProperty(
                campo.clave,
                Number(e.target.value),
              )
            : addProperty(
                campo.clave,
                e.target.value.trim(),
              )
        }
        fullWidth
        sx={{ mt: "8px" }}
        size="small"
      />
    );
  }
};
