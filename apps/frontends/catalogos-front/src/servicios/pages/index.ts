import ServiciosIndexPage from "./ServiciosIndex";
import NuevoServicioPage from "./NuevoServicio";
import EditarServicioPage from "./EditarServicio";

import { withProviders } from "../../store/withProviders";

export const ServiciosIndex = withProviders(
  ServiciosIndexPage,
);
export const NuevoServicio = withProviders(
  NuevoServicioPage,
);
export const EditarServicio = withProviders(
  EditarServicioPage,
);
