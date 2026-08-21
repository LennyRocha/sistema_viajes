import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Salidas | Nexoroute",
  description:
    "Listado operativo de salidas programadas, activas y canceladas.",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="operaciones/SalidasModule"
        exportName="SalidasIndex"
        skeletonVariant="table"
        requiredPrivileges={["salida:consultar", "salida:consultar-propias"]}
        allowedRoles={[
          "ROLE_ADMIN",
          "ROLE_OPERADOR",
          "ROLE_SUPERVISOR",
          "ROLE_CONDUCTOR",
        ]}
      />
    </MainLayout>
  );
}
