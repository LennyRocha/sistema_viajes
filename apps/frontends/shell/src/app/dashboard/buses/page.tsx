import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Autobuses | Nexoroute",
  description:
    "Panel administrativo para la gestión de autobuses",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="catalogos/AutobusesModule"
        exportName="AutobusesIndex"
        skeletonVariant="table"
        requiredPrivileges={["autobus:consultar"]}
        allowedRoles={["ROLE_ADMIN", "ROLE_SUPERVISOR"]}
      />
    </MainLayout>
  );
}
