import { Auditory } from '@commons/types';
import { Rol } from '../roles/rol.entity';

export interface Privilegio extends Pick<
  Auditory,
  'created_at' | 'updated_at'
> {
  id?: number;
  nombre: string;
  descripcion: string;
  estatus: boolean;
  roles?: RolePrivilege[];
}

export interface RolePrivilege {
  roleId: number;
  privilegeId: number;
  role: Rol;
  privilege: Privilegio;
}
