"use client";
import { useRouter } from "next/navigation";
import { federatedComponent } from "@/src/lib/loadRemote";
import MainLayout from "@/src/layout/MainLayout";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

const NuevoConductor = federatedComponent(
  "catalogos/ConductoresModule",
  "NuevoConductor",
  "form",
);

export const metadata: Metadata = {
  title: "Nuevo Conductor",
  description: "Sección para crear un nuevo conductor",
};

export default function Page() {
  const router = useRouter();
  const { showSidebar } = useSidebar();

  return (
    <MainLayout>
      <NuevoConductor
        navigationFunction={() =>
          router.push("/conductores")
        }
        openSidebar={showSidebar}
        userRoles={[]}
      />
    </MainLayout>
  );
}
