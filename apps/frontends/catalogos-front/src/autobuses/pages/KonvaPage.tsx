import React from "react";
import BusMap from "../components/BusMap";
import tiposBus from "../../tipos_autobus/constants/TiposBusMapper";
import Asiento from "../types/Asiento";
import { AsientoEstado } from "../types/AsientoEstado";

export default function KonvaPage() {
  const [seats, setSeats] = React.useState(
    tiposBus[0].seats,
  );

  const handleSelect = (seat: Asiento) => {
    setSeats((prev) =>
      prev.map((s) =>
        s.id === seat.id
          ? {
              ...s,
              estado:
                s.estado === AsientoEstado.SELECTED
                  ? AsientoEstado.AVAILABLE
                  : AsientoEstado.SELECTED,
            }
          : s,
      ),
    );

    console.log(seat);
  };

  return (
    <>
      <BusMap
        idTipo={1}
        asientos={seats}
        onSelectAsiento={handleSelect}
      />
      <BusMap
        idTipo={2}
        onSelectAsiento={(seat) =>
          console.log("Asiento 2", seat)
        }
      />
      <BusMap
        idTipo={3}
        onSelectAsiento={(seat) =>
          console.log("Asiento 3", seat)
        }
      />
    </>
  );
}
