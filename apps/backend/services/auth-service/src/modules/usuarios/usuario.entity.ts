import { Auditory } from '@commons/types';
import { UserRole } from '../roles/rol.entity';

export interface Usuario extends Pick<Auditory, 'created_at' | 'updated_at'> {
  id?: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  fecha_nacimiento: Date;
  telefono: string;
  email: string;
  foto_perfil: string;
  foto_base64?: string;
  estatus: boolean;
  roles?: UserRole[];
}
