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
  title: "Editar Viaje",
  description:
    "Sección para editar la información de un viaje, con opciones para modificar detalles del viaje, asignar paradas y actualizar la ruta.",
};

interface Props {
  params: {
    id: string;
  };
}

export default function Page({ params }: Readonly<Props>) {
  const router = useRouter();
  const { showSidebar } = useSidebar();

  return (
    <MainLayout>
      <NuevoViaje
        navigationFunction={router.push}
        openSidebar={showSidebar}
        userPrivileges={[]}
        snack={snack}
        viajeId={params.id}
      />
    </MainLayout>
  );
}
