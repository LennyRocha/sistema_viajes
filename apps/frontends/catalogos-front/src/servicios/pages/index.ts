import { default as ServiciosIndexPage } from "./ServiciosIndex";
import { default as NuevoServicioPage } from "./NuevoServicio";

import { withProviders } from "../../store/withProviders";

export const ServiciosIndex = withProviders(
  ServiciosIndexPage,
);
export const NuevoServicio = withProviders(
  NuevoServicioPage,
);
