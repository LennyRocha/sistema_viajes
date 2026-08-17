"use client";
import { Button } from "@mui/material";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useSalida } from "../providers/ViajeProvider";

type Props = {};

export default function ViajesList({}: Props) {
  const router = useRouter();
  const { addSalidaId, addPasajeros } = useSalida();
  const params = useSearchParams();
  return (
    <div>
      params {params.toString()}
      ViajesList
      <Button
        variant="contained"
        onClick={() => {
          addPasajeros(2);
          addSalidaId(1);
          router.push("/compra-tus-boletos");
        }}
      >
        Comprar boleto
      </Button>
    </div>
  );
}
