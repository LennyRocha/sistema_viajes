"use client";
import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";
import { useRouter } from "next/navigation";
const ServiciosIndex = federatedComponent(
  "catalogos/ServiciosModule",
  "ServiciosIndex",
);

export default function Page() {
  const router = useRouter();
  return (
    <MainLayout>
      <ServiciosIndex navigationFunction={router.push} />
    </MainLayout>
  );
}
