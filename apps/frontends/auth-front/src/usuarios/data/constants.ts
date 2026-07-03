export interface UsuarioMock {
  id: number;
  nombre: string;
  fecha_nacimiento: string;
  estatus: boolean;
  email: string;
  password: string;
}

export const usuarios: UsuarioMock[] = [
  {
    id: 1,
    nombre: "Ana Torres",
    fecha_nacimiento: "1990-05-15",
    estatus: true,
    email: "ana.torres@nexoroute.com",
    password: "********",
  },
  {
    id: 2,
    nombre: "Carlos Pérez",
    fecha_nacimiento: "1988-11-03",
    estatus: true,
    email: "carlos.perez@nexoroute.com",
    password: "********",
  },
  {
    id: 3,
    nombre: "María López",
    fecha_nacimiento: "1994-01-27",
    estatus: false,
    email: "maria.lopez@nexoroute.com",
    password: "********",
  },
  {
    id: 4,
    nombre: "Juan Hernández",
    fecha_nacimiento: "1992-08-19",
    estatus: true,
    email: "juan.hernandez@nexoroute.com",
    password: "********",
  },
  {
    id: 5,
    nombre: "Sofía Ramírez",
    fecha_nacimiento: "1997-12-09",
    estatus: false,
    email: "sofia.ramirez@nexoroute.com",
    password: "********",
  },
];