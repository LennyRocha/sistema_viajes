import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Conductores | Nexoroute",
  description:
    "Panel administrativo para la gestión de conductores",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="catalogos/ConductoresModule"
        exportName="ConductoresIndex"
        skeletonVariant="table"
      />
    </MainLayout>
  );
}
