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
    codigo_interno: string;
  }>;
};

const EditarAutobus = federatedComponent(
  "catalogos/AutobusesModule",
  "EditarAutobus",
  "form",
);

export const metadata: Metadata = {
  title: "Editar Autobus",
  description:
    "Sección para editar la información de un autobus",
};

export default function Page({ params }: Readonly<Props>) {
  const { codigo_interno } = use(params);
  const router = useRouter();
  const { showDialog } = useDialog();
  const { showSidebar, hideSidebar } = useSidebar();
  const pathname = usePathname();
  return (
    <MainLayout>
      <EditarAutobus
        navigationFunction={router.push}
        showDialog={showDialog}
        snack={snack}
        openSidebar={showSidebar}
        closeSidebar={hideSidebar}
        router={router}
        codigo_interno={codigo_interno}
        pathname={pathname}
        userRoles={[]}
      />
    </MainLayout>
  );
}
