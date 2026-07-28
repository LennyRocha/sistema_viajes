import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { use } from "react";

type Props = {
  params: Promise<{
    codigo_interno: string;
  }>;
};

export const metadata: Metadata = {
  title: "Editar Autobus | Nexoroute",
  description:
    "Sección para editar la información de un autobus",
};

export default function Page({ params }: Readonly<Props>) {
  const { codigo_interno } = use(params);
  return (
    <MainLayout>
      <FederatedPage
        remote="catalogos/AutobusesModule"
        exportName="EditarAutobus"
        skeletonVariant="form"
        params={{ codigo_interno }}
      />
    </MainLayout>
  );
}
