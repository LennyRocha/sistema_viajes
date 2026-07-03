"use client";

import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { useRouter } from "next/navigation";

const NuevoUsuario = federatedComponent(
  "auth/UsuariosModule",
  "NuevoUsuario",
);

export default function Page() {
  const { showSidebar } = useSidebar();
  const router = useRouter();
  return (
    <MainLayout>
      <NuevoUsuario
        openSidebar={showSidebar}
        navigationFunction={router.push}
      />
    </MainLayout>
  );
}
