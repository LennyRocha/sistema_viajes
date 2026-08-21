import { Compra } from "../types/Compra";

export default function useCompra() {
  const gatewayUrl =
    process.env.NEXT_PUBLIC_API_GATEWAY ??
    "http://localhost:5000";

  const createCompra = async (payload: CompraPayload) => {
    const res = await fetch(`${gatewayUrl}/compras`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      console.log("Error creating compra:", data);
      throw new Error(
        data.message || "Error al crear compra",
      );
    }
    return data;
  };

  const getCompraByCodigo = async (codigo: string) => {
    const res = await fetch(
      `${gatewayUrl}/compras/codigo/${codigo}`,
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data.message || "Error al obtener compra",
      );
    }
    return data;
  };

  const cancelarCompra = async (id: number) => {
    const res = await fetch(
      `${gatewayUrl}/compras/${id}/cancelar`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data.message || "Error al cancelar compra",
      );
    }
    return data;
  };

  const abordarCompra = async (codigo: string) => {
    const res = await fetch(
      `${gatewayUrl}/compras/abordar/${codigo}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data.message || "Error al abordar compra",
      );
    }
    return data;
  };

  return {
    createCompra,
    getCompraByCodigo,
    cancelarCompra,
    abordarCompra,
  };
}

interface CompraPayload extends Pick<
  Compra,
  | "salidaId"
  | "compradorId"
  | "pasajeros"
  | "asientos"
  | "monto"
> {
  compradorId: number;
  fechaSalida: string;
  horaSalida: string;
}
