import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next";
import { use } from "react";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Editar Conductor | Nexoroute",
  description: "Editar conductor",
};

export default function Page({
  params,
}: Readonly<Props>) {
  const { id } = use(params);

  return (
    <MainLayout>
      <FederatedPage
        remote="catalogos/ConductoresModule"
        exportName="EditarConductor"
        skeletonVariant="form"
        requiredPrivileges={["conductores:editar"]}
        allowedRoles={["ROLE_ADMIN"]}
        params={{ id }}
      />
    </MainLayout>
  );
}
