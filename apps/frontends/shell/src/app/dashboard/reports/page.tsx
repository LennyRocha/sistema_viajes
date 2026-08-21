import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Reportes de actividad | Nexoroute",
  description:
    "Consulta administrativa de autenticación, seguridad y operaciones del sistema.",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="dashboard-reportes/ReportesModule"
        exportName="ReportesActividadIndex"
        skeletonVariant="table"
        requiredPrivileges={["bitacora:consultar"]}
        allowedRoles={["ROLE_ADMIN"]}
      />
    </MainLayout>
  );
}
