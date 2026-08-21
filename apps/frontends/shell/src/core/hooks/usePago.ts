import { PagoPayload } from "../types/Pago";

export default function usePagos() {
  const gatewayUrl =
    process.env.NEXT_PUBLIC_API_GATEWAY ??
    "http://localhost:5000";

  const realizarPago = async (payload: PagoPayload) => {
    const res = await fetch(`${gatewayUrl}/pagos`, {
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

  const getPagosByCompra = async (id: number) => {
    const res = await fetch(`${gatewayUrl}/pagos/${id}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data.message || "Error al obtener compra",
      );
    }
    return data;
  };

  return {
    realizarPago,
    getPagosByCompra,
  };
}
