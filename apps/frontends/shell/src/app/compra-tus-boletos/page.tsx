import CompraForm from "@/src/layout/CompraForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boletos de autobus | Nexoroute",
  description:
    "Compra tus boletos para el evento de tu interés de manera rápida y segura.",
};

export default function page() {
  return <CompraForm />;
}
