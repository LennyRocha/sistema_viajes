import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import MainLayout from "../../layout/MainLayout";
import DashboardHomeClient from "./DashboardHomeClient";

export const metadata: Metadata = {
  title: "Dashboard | Nexoroute",
  description:
    "Panel operativo para coordinar rutas, viajes base, unidades y catalogos del sistema.",
};

export default function Page() {
  return (
    <MainLayout>
      <DashboardHomeClient />
    </MainLayout>
  );
}
