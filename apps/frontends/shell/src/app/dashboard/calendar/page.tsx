import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import React from "react";

type Props = {};

export const metadata: Metadata = {
  title: "Calendario de viajes",
  description:
    "Panel de consulta y gestión de viajes programados, con opciones para filtrar por fecha, destino y estado del viaje.",
};

export default function page({}: Props) {
  return (
    <MainLayout>
      <div>page Calendario</div>
    </MainLayout>
  );
}
