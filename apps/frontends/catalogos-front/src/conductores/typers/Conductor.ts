import Institucion from "../../instituciones/types/Institucion";
import Licencia from "./Licencia";
import ConductorEstado from "./ConductorEstado";

export default interface Conductor {
  id?: number;
  institucion: Institucion;
  nombre: string;
  apellido: string;
  curp: string;
  telefono: string;
  email: string;
  fecha_nacimiento: string;
  licencia: Licencia;
  estado: ConductorEstado;
  fotoPerfil: string; // URL string
}