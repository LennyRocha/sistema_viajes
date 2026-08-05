"use client";
import { Metadata } from "next";
import { useSearchParams } from "next/navigation";

/*export const metadata: Metadata = {
  title: "Búsqueda de viajes | Nexoroute",
  description:
    "Encuentra y reserva viajes de manera rápida y sencilla con Nexoroute. Explora opciones de transporte, compara precios y elige la mejor opción para tu próximo viaje.",
};*/

export default function Page() {
  const params = useSearchParams();
  return <div>page{params.toString()}</div>;
}
