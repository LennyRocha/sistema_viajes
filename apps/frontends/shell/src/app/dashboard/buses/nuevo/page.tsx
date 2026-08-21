import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import FederatedPage from "@/src/adapters/FederatedPage";

export const metadata: Metadata = {
  title: "Nuevo Autobus | Nexoroute",
  description: "Sección para crear un nuevo autobus",
};

const Page = () => {
  return (
    <MainLayout>
      <FederatedPage
        remote="catalogos/AutobusesModule"
        exportName="NuevoAutobus"
        skeletonVariant="form"
        requiredPrivileges={["autobus:crear"]}
        allowedRoles={["ROLE_ADMIN"]}
      />
    </MainLayout>
  );
};

export default Page;
