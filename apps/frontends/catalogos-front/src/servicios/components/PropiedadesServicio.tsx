import React from "react";
import ServicioExterno from "../types/ServicioExterno";
import { Box, Typography } from "@mui/material";

type Props = {
  servicio: ServicioExterno;
};

export default function PropiedadesServicio({
  servicio,
}: Readonly<Props>) {
  const defValue = (propiedad) => {
    const isObject =
      typeof propiedad.defaultValue === "object"
        ? JSON.stringify(propiedad.defaultValue)
        : String(propiedad.defaultValue);
    return propiedad.defaultValue
      ? isObject.length
      : "No aplica";
  };
  return (
    <>
      {servicio.propiedades.map((propiedad) => (
        <Box
          key={propiedad.clave}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h6"
            color="secondary"
            sx={{ fontWeight: "600" }}
          >
            {propiedad.label}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
          >
            Tipo de dato: {typeDato[propiedad.tipo]}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
          >
            Es obligatorio:{" "}
            {propiedad.requerido ? "Sí" : "No"}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
          >
            Visible condicionalmente:{" "}
            {propiedad.visible
              ? `Sí, cuando ${propiedad.visible.campo} es ${propiedad.visible.valor}`
              : "No"}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
          >
            Valor por defecto:{" "}
            {defValue(propiedad)}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
          >
            Texto de ayuda:{" "}
            {propiedad.placeholder
              ? propiedad.placeholder
              : "No aplica"}
          </Typography>
          {propiedad.tipo === "string" && (
            <>
              <Typography
                variant="caption"
                color="textSecondary"
              >
                Valor de lista desplegable:{" "}
                {propiedad.opciones ? "Si" : "No"}
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
              >
                Longitud mínima:{" "}
                {propiedad.minLength
                  ? propiedad.minLength
                  : "No aplica"}
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
              >
                Longitud máxima:{" "}
                {propiedad.maxLength
                  ? propiedad.maxLength
                  : "No aplica"}
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
              >
                Formato personalizado:{" "}
                {propiedad.regex
                  ? propiedad.regex
                  : "No aplica"}
              </Typography>
            </>
          )}
          {propiedad.tipo === "number" && (
            <>
              <Typography
                variant="caption"
                color="textSecondary"
              >
                Valor mínimo:{" "}
                {propiedad.min
                  ? propiedad.min
                  : "No aplica"}
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
              >
                Valor máximo:{" "}
                {propiedad.max
                  ? propiedad.max
                  : "No aplica"}
              </Typography>
            </>
          )}
        </Box>
      ))}
    </>
  );
}

const typeDato = {
  string: "Alfanumérico",
  number: "Numérico",
  boolean: "Condicional",
};
