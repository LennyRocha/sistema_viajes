import AutobusEstado from "../types/AutobusEstado";
import { AutobusSchema } from "../validations/autobusZod";

export const autobusTemplate: AutobusSchema = {
  codigo_interno: "",
  marca: "",
  alias: "",
  modelo: "",
  ano: new Date().getFullYear(),
  capacidad: 1,
  estado: AutobusEstado.DISPONIBLE,
  color: "",
  descripcion: "",
  servicios: [],
  tipo_autobus_id: 1,
  institucion_id: 1,
  asientos: [],
};
