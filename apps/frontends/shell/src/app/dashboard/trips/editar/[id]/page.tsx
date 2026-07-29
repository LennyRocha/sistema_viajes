import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { use } from "react";

export const metadata: Metadata = {
  title: "Editar Viaje | Nexoroute",
  description:
    "Sección para editar la información de un viaje, con opciones para modificar detalles del viaje, asignar paradas y actualizar la ruta.",
};

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: Readonly<Props>) {
  const { id } = use(params);
  return (
    <MainLayout>
      <FederatedPage
        remote="operaciones/ViajesModule"
        exportName="EditarViaje"
        skeletonVariant="form"
        params={{ viajeId: id }}
      />
    </MainLayout>
  );
}
