import { Auditory } from '@commons/types';
import { Usuario } from 'src/modules/usuarios/usuario.entity';
import { RolePrivilege } from '../privilegios/privilegio.entity';

export interface Rol extends Pick<Auditory, 'created_at' | 'updated_at'> {
  id?: number;
  nombre: string;
  descripcion: string;
  estatus: boolean;
  privilegios?: RolePrivilege[];
  usuarios?: UserRole[];
}

export interface UserRole {
  userId: number;
  roleId: number;
  user: Usuario;
  role: Rol;
}
