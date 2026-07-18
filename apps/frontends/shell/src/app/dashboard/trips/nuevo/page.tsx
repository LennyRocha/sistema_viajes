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
