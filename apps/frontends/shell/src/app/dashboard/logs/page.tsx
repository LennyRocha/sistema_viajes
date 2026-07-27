import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import React from "react";

type Props = {};

export const metadata: Metadata = {
  title: "Bitácora administrativa | Nexoroute",
  description:
    "Panel de consulta y gestión de bitácora administrativa, con opciones para filtrar por fecha, usuario y tipo de acción.",
};

export default function page({}: Props) {
  return (
    <MainLayout>
      <div>page Bitácora</div>
    </MainLayout>
  );
}
