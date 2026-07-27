"use client";
import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { usePathname, useRouter } from "next/navigation";
import { snack } from "@nexoroute/commons";
import { useDialog } from "@/src/providers/DialogProvider";
const ServiciosIndex = federatedComponent(
  "catalogos/ServiciosModule",
  "ServiciosIndex",
);

export default function Page() {
  const router = useRouter();
  const { showSidebar } = useSidebar();
  const { showDialog } = useDialog();
  const pathname = usePathname();
  return (
    <MainLayout>
      <ServiciosIndex
        navigationFunction={router.push}
        openSidebar={showSidebar}
        snack={snack}
        showDialog={showDialog}
        userPrivileges={[]}
        pathname={pathname}
        router={router}
        userRoles={[]}
      />
    </MainLayout>
  );
}
