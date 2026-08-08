import ViajesList from "@/src/layout/ViajesList";
import { Metadata } from "next";
import React from "react";

type Props = {
  params: Promise<{
    ruta: string;
  }>;
};

export const metadata: Metadata = {
  title: "Búsqueda de viajes | Nexoroute",
  description:
    "Encuentra y reserva viajes de manera rápida y sencilla con Nexoroute. Explora opciones de transporte, compara precios y elige la mejor opción para tu próximo viaje.",
};

export default function Page({ params }: Readonly<Props>) {
  const { ruta } = React.use(params);
  return (
    <div>
      page{ruta ? ` - ${ruta}` : ""}
      <ViajesList />
    </div>
  );
}
