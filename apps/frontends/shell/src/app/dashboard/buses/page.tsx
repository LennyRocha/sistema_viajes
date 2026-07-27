"use client";
import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useDialog } from "@/src/providers/DialogProvider";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { snack } from "@nexoroute/commons";
import { useRouter } from "next/navigation";

const AutobusesIndex = federatedComponent(
  "catalogos/AutobusesModule",
  "AutobusesIndex",
);

export default function Page() {
  const router = useRouter();
  const { showSidebar } = useSidebar();
  const { showDialog } = useDialog();
  return (
    <MainLayout>
      <AutobusesIndex
        navigationFunction={router.push}
        openSidebar={showSidebar}
        userPrivileges={[]}
        showDialog={showDialog}
        snack={snack}
        router={router}
        userRoles={[]}
      />
    </MainLayout>
  );
}
