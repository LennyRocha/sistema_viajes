// types/Conductor.ts
import Licencia from "./Licencia";

interface InstitucionResumen {
  id: number;
  nombre: string;
  descripcion: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  estatus: boolean;
}

export default interface Conductor {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  fecha_nacimiento: string; // ISO string
  telefono: string;
  email: string;
  foto_perfil: string;
  institucion_id: number;
  institucion: InstitucionResumen;
  licencia: Licencia | null; // ¡ojo! puede venir null, ver nota abajo
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  estatus: boolean;
}
