"use client";
import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { useRouter } from "next/navigation";
const ServiciosIndex = federatedComponent(
  "catalogos/ServiciosModule",
  "ServiciosIndex",
);

export default function Page() {
  const router = useRouter();
  const { showSidebar } = useSidebar();
  return (
    <MainLayout>
      <ServiciosIndex navigationFunction={router.push}  openSidebar={showSidebar} />
    </MainLayout>
  );
}
