import { Comprador } from "../types/Compra";

export default function useComprador() {
  const gatewayUrl =
    process.env.NEXT_PUBLIC_API_GATEWAY ??
    "http://localhost:5000";

  const findOrCreate = async (payload: Comprador) => {
    const res = await fetch(`${gatewayUrl}/compradores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data.message || "Error al crear comprador",
      );
    }
    return data;
  };

  const findOne = async (id: number) => {
    const res = await fetch(
      `${gatewayUrl}/compradores/${id}`,
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data.message || "Error al obtener comprador",
      );
    }
    return data;
  };

  return { findOrCreate, findOne };
}
