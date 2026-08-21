export default interface Usuario {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  foto_perfil: string;
  foto_base64: string | null;
  estatus: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}
