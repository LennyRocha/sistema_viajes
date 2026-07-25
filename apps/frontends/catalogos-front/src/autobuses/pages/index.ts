import AutobusesIndexPage from "./AutobusesIndex";
import NuevoAutobusPage from "./NuevoAutobus";
import EditarAutobusPage from "./EditarAutobus";

export { default as KonvaPage } from "./KonvaPage";

import { withProviders } from "../../store/withProviders";

export const AutobusesIndex = withProviders(
  AutobusesIndexPage,
);
export const NuevoAutobus = withProviders(NuevoAutobusPage);
export const EditarAutobus = withProviders(
  EditarAutobusPage,
);
