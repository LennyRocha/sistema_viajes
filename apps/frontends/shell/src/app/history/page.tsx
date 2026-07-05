"use client";

import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useSidebar } from "@/src/providers/SidebarProvider";

const HistorialIndex = federatedComponent(
  "dashboard-reportes/HistorialModule",
  "HistorialIndex",
);

export default function Page() {
  const { showSidebar } = useSidebar();
  return (
    <MainLayout>
      <HistorialIndex openSidebar={showSidebar} />
    </MainLayout>
  );
}
