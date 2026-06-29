"use client";
import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { useRouter } from "next/navigation";

const AutobusesIndex = federatedComponent(
  "catalogos/AutobusesModule",
  "AutobusesIndex",
);

export default function Page() {
  const router = useRouter();
  const { showSidebar } = useSidebar();
  return (
    <MainLayout>
      <AutobusesIndex
        onHeaderButtonClick={() =>
          router.push("/buses/nuevo")
        }
        openSidebar={showSidebar}
      />
    </MainLayout>
  );
}
