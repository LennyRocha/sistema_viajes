import MainLayout from "@/src/layout/MainLayout";
import React from "react";

type Props = {
  params: {
    nombre: string;
  };
};

export default async function page({ params }: Props) {
  const { nombre } = await params;
  return <MainLayout>page {nombre}</MainLayout>;
}
