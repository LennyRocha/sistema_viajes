"use client";

import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { useRouter } from "next/navigation";

const UsuariosIndex = federatedComponent(
  "auth/UsuariosModule",
  "UsuariosIndex",
);

export default function Page() {
  const { showSidebar } = useSidebar();
  const router = useRouter();
  return (
    <MainLayout>
      <UsuariosIndex
        openSidebar={showSidebar}
        navigationFunction={router.push}
      />
    </MainLayout>
  );
}
