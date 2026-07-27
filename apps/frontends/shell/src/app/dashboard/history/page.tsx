"use client";

import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

const HistorialIndex = federatedComponent(
  "dashboard-reportes/HistorialModule",
  "HistorialIndex",
);

export const metadata: Metadata = {
  title: "Historial de viajes",
  description:
    "Panel de consulta y gestión de viajes programados, con opciones para filtrar por fecha, destino y estado del viaje.",
};

export default function Page() {
  const { showSidebar } = useSidebar();
  return (
    <MainLayout>
      <HistorialIndex openSidebar={showSidebar} />
    </MainLayout>
  );
}
