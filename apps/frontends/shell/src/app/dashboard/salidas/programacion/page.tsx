import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Programacion de salidas | Nexoroute",
  description:
    "Flujo operativo para programar salidas a partir de viajes base, rutas, autobuses y conductores.",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="operaciones/SalidasModule"
        exportName="ProgramacionSalidas"
        skeletonVariant="form"
      />
    </MainLayout>
  );
}
