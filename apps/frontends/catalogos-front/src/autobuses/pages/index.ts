import AutobusesIndexPage from "./AutobusesIndex";
import NuevoAutobusPage from "./NuevoAutobus";
import EditarAutobusPage from "./EditarAutobus";

export { default as KonvaPage } from "./KonvaPage";
export { default as SeatSelector } from "./SeatSelector";
export { default as SeatCard } from "./SeatCard";
export { default as SeatBilling } from "./SeatBilling";

import { withProviders } from "../../store/withProviders";

export const AutobusesIndex = withProviders(
  AutobusesIndexPage,
);
export const NuevoAutobus = withProviders(NuevoAutobusPage);
export const EditarAutobus = withProviders(
  EditarAutobusPage,
);
