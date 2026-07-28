import React from "react";
import Institucion from "../types/Institucion";
export default function useInstitutionsFilter(
  data: Institucion[],
) {
  const [name, setName] = React.useState<string>("");
  const [description, setDescription] =
    React.useState<string>("");

  const list = React.useMemo(() => {
    if (name === "" && description === "") return data;
    if (!data) return [];
    if (name === "" && description !== "") {
      return data.filter((item) => {
        const descriptionMatch = item.descripcion
          .toLowerCase()
          .includes(description.toLowerCase());
        return descriptionMatch;
      });
    }
    if (name !== "" && description === "") {
      return data.filter((item) => {
        const nameMatch = item.nombre
          .toLowerCase()
          .includes(name.toLowerCase());
        return nameMatch;
      });
    }
    return data.filter((item) => {
      const nameMatch = item.nombre
        .toLowerCase()
        .includes(name.toLowerCase());
      const descriptionMatch = item.descripcion
        .toLowerCase()
        .includes(description.toLowerCase());
      return nameMatch && descriptionMatch;
    });
  }, [data, name, description]);

  const clearFilters = () => {
    setName("");
    setDescription("");
  };

  return {
    name,
    setName,
    description,
    setDescription,
    clearFilters,
    list,
  };
}
