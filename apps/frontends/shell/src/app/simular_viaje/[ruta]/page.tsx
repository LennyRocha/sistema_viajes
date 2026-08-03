import { Metadata } from "next";
import React from "react";

type Props = {
  params: Promise<{
    ruta: string;
  }>;
};

export const metadata: Metadata = {
  title: "Visualización de viaje | Nexoroute",
  description:
    "Visualiza en tiempo real los detalles de tu viaje en Nexoroute. Mediante nuestro mapa interactivo, podrás seguir la ubicación de tu transporte, conocer el estado del viaje y recibir actualizaciones importantes para una experiencia de viaje más segura y confiable.",
};

export default function Page({ params }: Readonly<Props>) {
  const { ruta } = React.use(params);
  return <div>page{ruta ? ` - ${ruta}` : ""}</div>;
}
