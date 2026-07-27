"use client";

import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useDialog } from "@/src/providers/DialogProvider";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { snack } from "@nexoroute/commons";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { usePathname, useRouter } from "next/navigation";
import { use } from "react";

type Props = {
  params: Promise<{
    nombre: string;
  }>;
};

const DisponibilidadIndex = federatedComponent(
  "catalogos/DisponibilidadModule",
  "DiponibilidadIndex",
  "table",
);

export const metadata: Metadata = {
  title: "Disponibilidad de servicios",
  description:
    "Sección para administrar la disponibilidad de un servicio",
};

export default function Page({ params }: Readonly<Props>) {
  const { nombre } = use(params);
  const router = useRouter();
  const { showDialog } = useDialog();
  const { showSidebar, hideSidebar } = useSidebar();
  const pathname = usePathname();
  return (
    <MainLayout>
      <DisponibilidadIndex
        servicio={nombre}
        navigationFunction={router.push}
        showDialog={showDialog}
        snack={snack}
        openSidebar={showSidebar}
        closeSidebar={hideSidebar}
        router={router}
        servicioName={nombre}
        pathname={pathname}
        userRoles={[]}
      />
    </MainLayout>
  );
}
