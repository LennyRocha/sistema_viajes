"use client";

import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useDialog } from "@/src/providers/DialogProvider";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { snack } from "@nexoroute/commons";
import { usePathname, useRouter } from "next/navigation";
import { use } from "react";

const EditarInstitucion = federatedComponent(
  "catalogos/InstitucionesModule",
  "EditarInstitucion",
  "form",
);

type Props = {
  params: Promise<{
    nombre: string;
  }>;
};

export default function Page({ params }: Readonly<Props>) {
  const { nombre } = use(params);
  const router = useRouter();
  const { showDialog } = useDialog();
  const { showSidebar, hideSidebar } = useSidebar();
  const pathname = usePathname();
  return (
    <MainLayout>
      <EditarInstitucion
        navigationFunction={router.push}
        showDialog={showDialog}
        snack={snack}
        openSidebar={showSidebar}
        closeSidebar={hideSidebar}
        router={router}
        institucionNombre={nombre}
        pathname={pathname}
        userRoles={[]}
      />
    </MainLayout>
  );
}
