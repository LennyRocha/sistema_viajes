"use client";

import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { useRouter } from "next/navigation";

const NuevoUsuario = federatedComponent(
  "auth/UsuariosModule",
  "NuevoUsuario",
  "form",
);

export const metadata: Metadata = {
  title: "Dar de alta un nuevo usuario",
  description:
    "Panel de gestión para dar de alta un nuevo usuario, con opciones para ingresar información personal, asignar roles y permisos, y configurar la cuenta.",
};

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
