import FederatedPage from "@/src/adapters/FederatedPage";
import MainLayout from "@/src/layout/MainLayout";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Dar de alta un nuevo usuario | Nexoroute",
  description:
    "Panel de gestión para dar de alta un nuevo usuario, con opciones para ingresar información personal, asignar roles y permisos, y configurar la cuenta.",
};

export default function Page() {
  return (
    <MainLayout>
      <FederatedPage
        remote="catalogos/UsuariosModule"
        exportName="NuevoUsuario"
        skeletonVariant="form"
      />
    </MainLayout>
  );
}
