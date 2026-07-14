"use client";

import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { snack } from "@nexoroute/commons";
import { useRouter } from "next/navigation";

const NuevoViaje = federatedComponent(
  "operaciones/ViajesModule",
  "NuevoViaje",
  "form"
);

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
