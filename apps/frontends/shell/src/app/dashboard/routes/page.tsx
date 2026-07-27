import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import React from "react";

type Props = {};

export const metadata: Metadata = {
  title: "Rutas y paradas",
  description:
    "Panel administrativo para la gestión de rutas y paradas, con opciones para agregar, editar y eliminar rutas, así como para visualizar detalles de cada ruta y sus paradas asociadas.",
};

export default function page({}: Props) {
  return (
    <MainLayout>
      <div>page Rutas</div>
    </MainLayout>
  );
}
