import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Cuentas de usuarios | Nexoroute",
  description:
    "Panel de gestión de cuentas de usuarios, con opciones para agregar, editar y eliminar usuarios, así como para asignar roles y permisos.",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="auth/UsuariosModule"
        exportName="UsuariosIndex"
        skeletonVariant="table"
        requiredPrivileges={["usuarios:consultar"]}
        allowedRoles={["ROLE_ADMIN"]}
      />
    </MainLayout>
  );
}
