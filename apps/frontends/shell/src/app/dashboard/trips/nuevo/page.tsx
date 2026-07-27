import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Dar de alta un nuevo viaje | Nexoroute",
  description:
    "Panel de gestión para dar de alta un nuevo viaje, con opciones para ingresar información del viaje, asignar paradas y configurar la ruta.",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="catalogos/ViajesModule"
        exportName="NuevoViaje"
        skeletonVariant="form"
      />
    </MainLayout>
  );
}
