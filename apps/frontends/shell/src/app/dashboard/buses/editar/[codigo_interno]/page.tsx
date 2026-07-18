import MainLayout from "@/src/layout/MainLayout";
import React from "react";

type Props = {
  params: {
    codigo_interno: string;
  };
};

export default async function page({ params }: Props) {
  const { codigo_interno } = await params;
  return <MainLayout>page {codigo_interno}</MainLayout>;
}
