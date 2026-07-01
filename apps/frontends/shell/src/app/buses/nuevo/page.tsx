"use client";

import { useRouter } from "next/navigation";
import { federatedComponent } from "@/src/lib/loadRemote";
import MainLayout from "@/src/layout/MainLayout";
import { useSidebar } from "@/src/providers/SidebarProvider";

const NuevoAutobus = federatedComponent(
  "catalogos/AutobusesModule",
  "NuevoAutobus",
);

const Page = () => {
  const router = useRouter();
  const sidebar = useSidebar();
  return (
    <MainLayout>
    <NuevoAutobus
      navigationFunction={() => router.push("/buses")}
        openSidenbar={sidebar.showSidebar}
    />
    </MainLayout>
  );
};

export default Page;
