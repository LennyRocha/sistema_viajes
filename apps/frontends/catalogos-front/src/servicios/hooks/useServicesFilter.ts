import React from "react";
import ServicioExterno from "../types/ServicioExterno";
export default function useServicesFilter(
  data: ServicioExterno[],
) {
  const [query, setQuery] = React.useState("");
  const options = {
    "": "sin filtro",
    predeterminada: "predeterminada",
    personalizada: "personalizada",
  };
  const [option, setOption] =
    React.useState<keyof typeof options>("");

  const list = React.useMemo(() => {
    if (!query && option === "") return data;
    if (!data) return [];
    const lowerQuery = query.toLowerCase();
    return option === ""
      ? data.filter((servicio) =>
          servicio.nombre
            .toLowerCase()
            .includes(lowerQuery),
        )
      : data.filter((servicio) =>
          servicio.nombre
            .toLowerCase()
            .includes(lowerQuery) &&
          options[option] === "predeterminada"
            ? servicio.disponibilidad?.length === 0
            : servicio.disponibilidad?.length > 0,
        );
  }, [data, query, option]);

  return {
    query,
    setQuery,
    options,
    list,
    option,
    setOption,
  };
}
