import React from "react";
import CampoConfig from "../../servicios/types/CampoServicio";

type Props = {
  campo: CampoConfig;
  addCampo: (campo: CampoConfig) => void;
};

export default function CampoField({
  campo,
  addCampo,
}: Readonly<Props>) {
  return <div>{campo.label}</div>;
}
