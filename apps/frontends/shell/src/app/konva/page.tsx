"use client";
import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useDialog } from "@/src/providers/DialogProvider";
import { useSidebar } from "@/src/providers/SidebarProvider";
import { snack } from "@nexoroute/commons";
import { useRouter } from "next/navigation";

const AutobusKonva = federatedComponent(
  "catalogos/AutobusesModule",
  "KonvaPage",
);

type Props = {};

export default function page({}: Props) {
  return (
    <MainLayout>
      <AutobusKonva />
    </MainLayout>
  );
}
