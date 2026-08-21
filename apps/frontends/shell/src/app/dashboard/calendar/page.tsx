import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Calendario de viajes | Nexoroute",
  description:
    "Panel de consulta y gestión de viajes programados, con opciones para filtrar por fecha, destino y estado del viaje.",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="operaciones/CalendarioModule"
        exportName="CalendarioIndex"
        skeletonVariant="table"
      />
    </MainLayout>
  );
}
