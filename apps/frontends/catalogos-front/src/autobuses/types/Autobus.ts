import Institucion from "../../instituciones/types/Institucion";
import TipoAutobus from "../../tipos_autobus/types/TipoAutobus";
import AutobusServicio from "./AutobusServicio";
import AutobusEstado from "./AutobusEstado";
import { Auditory } from "@nexoroute/commons";
import Asiento from "./Asiento";

export default interface Autobus extends Auditory {
  id?: number;
  institucion: Institucion;
  tipoAutobus: TipoAutobus;
  alias: string;
  marca: string;
  modelo: string;
  descripcion: string;
  ano: number;
  capacidad: number;
  color: string;
  codigo_interno: string;
  estado: AutobusEstado;
  estatus: boolean;
  slug: string;
  asientos: Asiento[];
  servicios?: AutobusServicio[];
  institucion_id: number;
  tipo_autobus_id: number;
}
