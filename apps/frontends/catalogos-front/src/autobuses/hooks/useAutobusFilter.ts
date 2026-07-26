import React from "react";
import Autobus from "../types/Autobus";
import { BusTablaType } from "../types/BusTablaType";

export default function useBusesFilter(
  data: Autobus[],
  setTipoBus: React.Dispatch<React.SetStateAction<number>>,
  setInstitucion: React.Dispatch<
    React.SetStateAction<number>
  >,
  tipoBus: number,
  institucion: number,
) {
  const [alias, setAlias] = React.useState("");
  const [codigo, setCodigo] = React.useState("");

  React.useEffect(() => {
    if (alias !== "" || codigo !== "") {
      setTipoBus(0);
      setInstitucion(0);
    } else if (tipoBus !== 0 || institucion !== 0) {
      setAlias("");
      setCodigo("");
    }
  }, [tipoBus, institucion, alias, codigo]);

  const list = React.useMemo(() => {
    let filtered = data;
    if (alias !== "" && codigo === "") {
      filtered = filtered.filter((bus) =>
        bus.alias
          .toLowerCase()
          .includes(alias.toLowerCase()),
      );
    }
    if (codigo !== "" && alias === "") {
      filtered = filtered.filter((bus) =>
        bus.codigo_interno
          .toLowerCase()
          .includes(codigo.toLowerCase()),
      );
    }
    if (alias !== "" && codigo !== "") {
      filtered = filtered.filter(
        (bus) =>
          bus.alias
            .toLowerCase()
            .includes(alias.toLowerCase()) &&
          bus.codigo_interno
            .toLowerCase()
            .includes(codigo.toLowerCase()),
      );
    }
    return filtered.map((bus) => ({
      ...bus,
      autobus_estado: bus.estado,
    })) as BusTablaType[];
  }, [data, alias, codigo]);

  const clearFilters = () => {
    setAlias("");
    setCodigo("");
    setTipoBus(0);
    setInstitucion(0);
  };

  return {
    alias,
    setAlias,
    codigo,
    setCodigo,
    list,
    clearFilters,
  };
}
