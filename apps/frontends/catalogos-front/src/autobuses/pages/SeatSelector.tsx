import React from "react";
import BusMap from "../components/BusMap";
import Asiento from "../types/Asiento";
import { Box } from "@mui/material";
import AsientoSimbología from "../components/AsientoSimbología";

type Props = {
  tipo: number;
  seats?: Asiento[];
  onSelect: (seat: Asiento) => void;
};

export default function SeatSelector({
  tipo,
  seats,
  onSelect,
}: Readonly<Props>) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        width: "100%",
        position: "static",
      }}
    >
      <Box sx={{ mx: "auto", display: "block" }}>
        <BusMap
          idTipo={tipo}
          {...(seats && { asientos: seats })}
          onSelectAsiento={onSelect}
        />
      </Box>
      <AsientoSimbología />
    </Box>
  );
}
