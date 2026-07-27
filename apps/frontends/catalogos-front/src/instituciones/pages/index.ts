import InstitucionesIndexPage from "./InstitucionesIndex";
import NuevaInstitucionPage from "./NuevaInstitucion";
import EditarInstitucionPage from "./EditarInstitucion";

import { withProviders } from "../../store/withProviders";

export const InstitucionesIndex = withProviders(
  InstitucionesIndexPage,
);
export const NuevaInstitucion = withProviders(
  NuevaInstitucionPage,
);
export const EditarInstitucion = withProviders(
  EditarInstitucionPage,
);
