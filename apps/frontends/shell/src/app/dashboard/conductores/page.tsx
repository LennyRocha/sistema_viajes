"use client";
import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useDialog } from "@/src/providers/DialogProvider";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { snack } from "@nexoroute/commons";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { useRouter } from "next/navigation";

const ConductoresIndex = federatedComponent(
  "catalogos/ConductoresModule",
  "ConductoresIndex",
);

export const metadata: Metadata = {
  title: "Conductores",
  description:
    "Panel administrativo para la gestión de conductores",
};

export default function Page() {
  const router = useRouter();
  const { showSidebar } = useSidebar();
  const { showDialog } = useDialog();

  return (
    <MainLayout>
      <ConductoresIndex
        navigationFunction={router.push}
        openSidebar={showSidebar}
        userPrivileges={[]}
        showDialog={showDialog}
        snack={snack}
        userRoles={[]}
      />
    </MainLayout>
  );
}
