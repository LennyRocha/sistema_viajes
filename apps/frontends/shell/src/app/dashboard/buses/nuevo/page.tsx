"use client";

import { usePathname, useRouter } from "next/navigation";
import { federatedComponent } from "@/src/lib/loadRemote";
import MainLayout from "@/src/layout/MainLayout";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { useDialog } from "@/src/providers/DialogProvider";
import { snack } from "@nexoroute/commons";

const NuevoAutobus = federatedComponent(
  "catalogos/AutobusesModule",
  "NuevoAutobus",
  "form",
);

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
      />
    </MainLayout>
  );
};

export default Page;
