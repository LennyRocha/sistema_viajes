"use client";

import { usePathname, useRouter } from "next/navigation";
import { federatedComponent } from "@/src/lib/loadRemote";
import MainLayout from "@/src/layout/MainLayout";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { useDialog } from "@/src/providers/DialogProvider";
import { snack } from "@nexoroute/commons";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

const NuevoAutobus = federatedComponent(
  "catalogos/AutobusesModule",
  "NuevoAutobus",
  "form",
);

export const metadata: Metadata = {
  title: "Nuevo Autobus",
  description: "Sección para crear un nuevo autobus",
};

const Page = () => {
  const router = useRouter();
  const { showDialog } = useDialog();
  const { showSidebar, hideSidebar } = useSidebar();
  const pathname = usePathname();
  return (
    <MainLayout>
      <NuevoAutobus
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
};

export default Page;
