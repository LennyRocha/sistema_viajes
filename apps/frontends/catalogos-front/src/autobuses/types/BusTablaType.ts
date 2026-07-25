import Autobus from "./Autobus";
import AutobusEstado from "./AutobusEstado";

type AutobusSinEstado = Omit<Autobus, "estado">;
export type BusTablaType = AutobusSinEstado & {
  autobus_estado: AutobusEstado;
};
