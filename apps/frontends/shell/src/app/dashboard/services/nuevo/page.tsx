"use client";
import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useDialog } from "@/src/providers/DialogProvider";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { snack } from "@nexoroute/commons";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { usePathname, useRouter } from "next/navigation";
const NuevoServicio = federatedComponent(
  "catalogos/ServiciosModule",
  "NuevoServicio",
  "form",
);

export const metadata: Metadata = {
  title: "Nuevo Servicio",
  description:
    "Sección para crear un nuevo servicio",
};

export default function Page() {
  const router = useRouter();
  const { showDialog } = useDialog();
  const { showSidebar, hideSidebar } = useSidebar();
  const pathname = usePathname();
  return (
    <MainLayout>
      <NuevoServicio
        navigationFunction={router.push}
        showDialog={showDialog}
        snack={snack}
        openSidebar={showSidebar}
        closeSidebar={hideSidebar}
        router={router}
        pathname={pathname}
        userRoles={[]}
      />
    </MainLayout>
  );
}
