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
  title: "Editar Institución | Nexoroute",
  description:
    "Sección para editar la información de una institución en el panel administrativo",
};

export default function Page({ params }: Readonly<Props>) {
  const { nombre } = use(params);
  return (
    <MainLayout>
      <FederatedPage
        remote="catalogos/InstitucionesModule"
        exportName="EditarInstitucion"
        skeletonVariant="form"
        params={{ institucionNombre: nombre }}
      />
    </MainLayout>
  );
}
