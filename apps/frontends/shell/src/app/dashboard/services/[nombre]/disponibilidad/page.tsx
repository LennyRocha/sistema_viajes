import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { use } from "react";

type Props = {
  params: Promise<{
    nombre: string;
  }>;
};

export const metadata: Metadata = {
  title: "Disponibilidad de servicios | Nexoroute",
  description:
    "Sección para administrar la disponibilidad de un servicio",
};

export default function Page({ params }: Readonly<Props>) {
  const { nombre } = use(params);
  return (
    <MainLayout>
      <FederatedPage
        remote="catalogos/DisponibilidadModule"
        exportName="DisponibilidadIndex"
        skeletonVariant="table"
        params={{ servicioName: nombre, servicio: nombre }}
      />
    </MainLayout>
  );
}
