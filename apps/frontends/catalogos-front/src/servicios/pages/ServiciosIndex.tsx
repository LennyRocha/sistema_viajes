import { PaperHeader } from "@nexoroute/commons";
import React from "react";
import { useRouter } from "next/router";

export default function ServiciosIndex() {
  const router = useRouter();

  return (
    <div>
      <PaperHeader
        title="Servicios"
        subtitle="Listado de servicios"
        iconname="room_service"
        showButton
        onButtonClick={() => router.push("/servicios/nuevo")}
      />
    </div>
  );
}
