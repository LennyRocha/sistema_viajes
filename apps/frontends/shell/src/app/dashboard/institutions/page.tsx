import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Instituciones | Nexoroute",
  description:
    "Panel administrativo para la gestión de instituciones",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="catalogos/InstitucionesModule"
        exportName="InstitucionesIndex"
        skeletonVariant="table"
        requiredPrivileges={["catalogo:administrar"]}
        allowedRoles={["ROLE_ADMIN"]}
      />
    </MainLayout>
  );
}
