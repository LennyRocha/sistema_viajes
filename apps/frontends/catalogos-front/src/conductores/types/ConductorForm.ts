export type FormState = {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  foto_perfil: string;
  institucion_id: number | "";
  licencia: {
    numero_licencia: string;
    categoria: string;
    fecha_expedicion: string;
    fecha_vencimiento: string;
    estado_emisor: string;
    imagen_licencia: string;
    vigente: boolean;
  };
};

export const initialState: FormState = {
  nombres: "",
  apellido_paterno: "",
  apellido_materno: "",
  curp: "",
  fecha_nacimiento: "",
  telefono: "",
  email: "",
  foto_perfil: "",
  institucion_id: "",
  licencia: {
    numero_licencia: "",
    categoria: "",
    fecha_expedicion: "",
    fecha_vencimiento: "",
    estado_emisor: "",
    imagen_licencia: "",
    vigente: true,
  },
};