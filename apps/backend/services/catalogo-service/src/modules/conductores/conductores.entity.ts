import { Auditory } from '@commons/types';
import { Institucion } from 'src/modules/instituciones/institucion.entity'; 
import Licencia from 'src/modules/licencias/licencias.entity'; 

export default interface Conductor extends Auditory {
  id?: number;

  // Datos personales
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  fecha_nacimiento: Date;
  telefono: string;
  email: string;
  foto_perfil: string;

  // Estado lógico
  estatus: boolean;

  // Relaciones
  institucion: Institucion;
  institucion_id: number;

  licencias?: Licencia[];
}