import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Nuevo Servicio  | Nexoroute",
  description: "Sección para crear un nuevo servicio",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="catalogos/ServiciosModule"
        exportName="NuevoServicio"
        skeletonVariant="form"
      />
    </MainLayout>
  );
}
