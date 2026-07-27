"use client";

import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { useRouter } from "next/navigation";

const UsuariosIndex = federatedComponent(
  "auth/UsuariosModule",
  "UsuariosIndex",
);

export const metadata: Metadata = {
  title: "Cuentas de usuarios",
  description:
    "Panel de gestión de cuentas de usuarios, con opciones para agregar, editar y eliminar usuarios, así como para asignar roles y permisos.",
};

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
