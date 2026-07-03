"use client";
import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useRouter } from "next/navigation";
const NuevoServicio = federatedComponent(
  "catalogos/ServiciosModule",
  "NuevoServicio",
);

export default function Page() {
  const router = useRouter();
  return (
    <MainLayout>
      <NuevoServicio navigationFunction = {router.push} />
    </MainLayout>
  );
}
