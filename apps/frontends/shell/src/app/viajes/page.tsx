import ViajesList from "@/src/layout/ViajesList";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Búsqueda de viajes | Nexoroute",
  description:
    "Encuentra y reserva viajes de manera rápida y sencilla con Nexoroute. Explora opciones de transporte, compara precios y elige la mejor opción para tu próximo viaje.",
};

export default function page() {
  return (
    <div>
      <Suspense fallback={<div> Cargando viajes... </div>}>
        <ViajesList />
      </Suspense>
    </div>
  );
}
