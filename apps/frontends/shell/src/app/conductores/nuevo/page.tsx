"use client";
import { useRouter } from "next/navigation";
import { federatedComponent } from "@/src/lib/loadRemote";
import MainLayout from "@/src/layout/MainLayout";
import { useSidebar } from "@/src/providers/SidebarProvider";

const NuevoConductor = federatedComponent(
  "catalogos/ConductoresModule",
  "NuevoConductor",
);

export default function Page() {
  const router = useRouter();
  const { showSidebar } = useSidebar();

  return (
    <MainLayout>
      <NuevoConductor
        navigationFunction={() => router.push("/conductores")}
        openSidebar={showSidebar}
      />
    </MainLayout>
  );
}