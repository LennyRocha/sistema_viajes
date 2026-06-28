import { PaperHeader } from "@nexoroute/commons";
import React from "react";

interface Props {
  onHeaderButtonClick: () => void;
}

export default function ServiciosIndex({
  onHeaderButtonClick,
}: Readonly<Props>) {
  return (
    <div>
      <PaperHeader
        title="Servicios"
        subtitle="Listado de servicios"
        iconname="room_service"
        showButton
        onButtonClick={onHeaderButtonClick}
      />
    </div>
  );
}
