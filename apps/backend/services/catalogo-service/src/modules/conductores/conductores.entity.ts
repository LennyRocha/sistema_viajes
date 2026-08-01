import { Auditory } from '@commons/types';
import { Institucion } from 'src/modules/instituciones/institucion.entity'; 
import Licencia from 'src/modules/licencias/licencias.entity'; 

export default interface Conductor extends Auditory {
  id?: number;
  usuario_id: number;
  
  // Estado lógico
  estatus: boolean;

  // Relaciones
  institucion: Institucion;
  institucion_id: number;

  licencias?: Licencia[];
}