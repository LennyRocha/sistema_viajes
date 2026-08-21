import CompraDetails from "@/src/layout/CompraDetails";
import { Metadata } from "next";
import React from "react";

type Props = {
  params: Promise<{
    codigo_seguridad: string;
  }>;
};

export const metadata: Metadata = {
  title: "Detalles de compra | Nexoroute",
  description:
    "Obtén información detallada sobre tu compra de boletos de autobús en Nexoroute. Revisa los detalles de tu transacción, incluyendo el código de seguridad y la información del viaje.",
};

export default function Page({ params }: Readonly<Props>) {
  const { codigo_seguridad } = React.use(params);
  return <CompraDetails codigo_compra={codigo_seguridad} />;
}
