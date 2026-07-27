import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import FederatedPage from "@/src/adapters/FederatedPage";

export const metadata: Metadata = {
  title: "Servicios | Nexoroute",
  description:
    "Panel administrativo para la gestión de servicios",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="catalogos/ServiciosModule"
        exportName="ServiciosIndex"
        skeletonVariant="table"
      />
    </MainLayout>
  );
}
