"use client";

import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useDialog } from "@/src/providers/DialogProvider";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { snack } from "@nexoroute/commons";
import { usePathname, useRouter } from "next/navigation";
import { Metadata } from "next";

const NuevaInstitucion = federatedComponent(
  "catalogos/InstitucionesModule",
  "NuevaInstitucion",
  "form",
);

export const metadata: Metadata = {
  title: "Nueva Institución",
  description: "Sección para crear una nueva institución",
};

export default function Page() {
  const router = useRouter();
  const { showDialog } = useDialog();
  const { showSidebar, hideSidebar } = useSidebar();
  const pathname = usePathname();
  return (
    <MainLayout>
      <NuevaInstitucion
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
