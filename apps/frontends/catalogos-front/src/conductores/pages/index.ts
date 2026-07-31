import ConductoresIndexPage from "./ConductoresIndex";
import NuevoConductorPage from "./NuevoConductor";
import EditarConductorPage from "./EditarConductor";

import { withProviders } from "../../store/withProviders";

export const EditarConductor = withProviders(EditarConductorPage);

export const ConductoresIndex = withProviders(
  ConductoresIndexPage,
);
export const NuevoConductor = withProviders(NuevoConductorPage);


