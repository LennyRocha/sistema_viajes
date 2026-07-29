import ConductoresIndexPage from "./ConductoresIndex";
import NuevoConductorPage from "./NuevoConductor";


import { withProviders } from "../../store/withProviders";

export const ConductoresIndex = withProviders(
  ConductoresIndexPage,
);
export const NuevoConductor = withProviders(NuevoConductorPage);
