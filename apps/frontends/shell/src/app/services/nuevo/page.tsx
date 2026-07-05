"use client";
import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useDialog } from "@/src/providers/DialogProvider";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { snack } from "@nexoroute/commons";
import { useRouter } from "next/navigation";
const NuevoServicio = federatedComponent(
  "catalogos/ServiciosModule",
  "NuevoServicio",
);

export default function Page() {
  const router = useRouter();
  const { showDialog } = useDialog();
  const { showSidebar } = useSidebar();
  return (
    <MainLayout>
      <NuevoServicio
        navigationFunction={router.push}
        showDialog={showDialog}
        snack={snack}
        openSidebar={showSidebar}
      />
    </MainLayout>
  );
}
