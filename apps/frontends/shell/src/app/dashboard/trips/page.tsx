"use client";

import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { snack } from "@nexoroute/commons";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { useRouter } from "next/navigation";

const ViajesIndex = federatedComponent(
  "operaciones/ViajesModule",
  "ViajesIndex",
);

export const metadata: Metadata = {
  title: "Viajes",
  description:
    "Panel de control para la gestión de viajes, con opciones para agregar, editar y eliminar viajes, así como para visualizar detalles de cada viaje y sus paradas asociadas.",
};

export default function Page() {
  const router = useRouter();
  const { showSidebar } = useSidebar();

  return (
    <MainLayout>
      <ViajesIndex
        navigationFunction={router.push}
        openSidebar={showSidebar}
        userPrivileges={[]}
        snack={snack}
      />
    </MainLayout>
  );
}
