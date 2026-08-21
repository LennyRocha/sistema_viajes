import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next";
import FederatedPage from "@/src/adapters/FederatedPage";

export const metadata: Metadata = {
  title: "Nueva Institución | Nexoroute",
  description: "Sección para crear una nueva institución",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="catalogos/InstitucionesModule"
        exportName="NuevaInstitucion"
        skeletonVariant="form"
        requiredPrivileges={["catalogo:administrar"]}
      />
    </MainLayout>
  );
}
