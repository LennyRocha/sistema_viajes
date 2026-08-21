import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Rutas y paradas | Nexoroute",
  description:
    "Panel administrativo para gestionar rutas reutilizables, paradas y recorridos geograficos.",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="operaciones/ViajesModule"
        exportName="RutasIndex"
        skeletonVariant="table"
        requiredPrivileges={["ruta:consultar"]}
        allowedRoles={["ROLE_ADMIN", "ROLE_SUPERVISOR"]}
      />
    </MainLayout>
  );
}
