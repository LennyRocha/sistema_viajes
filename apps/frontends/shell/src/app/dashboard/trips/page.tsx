import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Viajes | Nexoroute",
  description:
    "Panel de control para la gestión de viajes, con opciones para agregar, editar y eliminar viajes, así como para visualizar detalles de cada viaje y sus paradas asociadas.",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="operaciones/ViajesModule"
        exportName="ViajesIndex"
        skeletonVariant="table"
      />
    </MainLayout>
  );
}
