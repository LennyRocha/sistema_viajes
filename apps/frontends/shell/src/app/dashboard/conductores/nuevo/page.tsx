import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import FederatedPage from "@/src/adapters/FederatedPage";

export const metadata: Metadata = {
  title: "Nuevo Conductor | Nexoroute",
  description: "Sección para crear un nuevo conductor",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="catalogos/ConductoresModule"
        exportName="NuevoConductor"
        skeletonVariant="form"
        requiredPrivileges={["conductores:crear"]}
        allowedRoles={["ROLE_ADMIN"]}
      />
    </MainLayout>
  );
}
