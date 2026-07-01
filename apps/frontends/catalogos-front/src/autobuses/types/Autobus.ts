import Institucion from "../../instituciones/types/Institucion";
import TipoAutobus from "../../tipos_autobus/types/TipoAutobus";
import AutobusServicio from "./AutobusServicio";
import AutobusEstado from "./AutobusEstado";

export default interface Autobus {
  id?: number;
  institucion: Institucion;
  tipo: TipoAutobus;
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
  servicios?: AutobusServicio[];
}
