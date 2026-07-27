"use client";

import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { snack } from "@nexoroute/commons";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { useRouter } from "next/navigation";

const NuevoViaje = federatedComponent(
  "operaciones/ViajesModule",
  "NuevoViaje",
  "form",
);

export const metadata: Metadata = {
  title: "Dar de alta un nuevo viaje",
  description:
    "Panel de gestión para dar de alta un nuevo viaje, con opciones para ingresar información del viaje, asignar paradas y configurar la ruta.",
};

export default function Page() {
  const router = useRouter();
  const { showSidebar } = useSidebar();

  return (
    <MainLayout>
      <NuevoViaje
        navigationFunction={router.push}
        openSidebar={showSidebar}
        userPrivileges={[]}
        snack={snack}
      />
    </MainLayout>
  );
}
