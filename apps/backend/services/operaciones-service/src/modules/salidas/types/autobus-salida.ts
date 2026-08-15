export type AsientoAutobus = {
  id: string;
  x: number;
  y: number;
  label: string;
  estado: any;
};

export type ServicioAutobus = {
  id?: number;
  activo?: boolean;
  config_servicio?: Record<string, any>;
  servicio?: {
    id?: number;
    nombre?: string;
    descripcion?: string | null;
    icono_nombre?: string;
  } | null;
};

export type TipoAutobusResumen = {
  id: number;
  nombre: string;
  descripcion: string;
  linea: string;
  capacidad: number;
};

export type AutobusSalidaResponse = {
  id: number;
  alias?: string;
  marca?: string;
  modelo?: string;
  codigo_interno?: string;
  institucion?: {
    id?: number | null;
    imagen_url?: string | null;
    nombre?: string;
  } | null;
  asientos?: AsientoAutobus[];
  servicios?: ServicioAutobus[];
  tipoAutobus?: TipoAutobusResumen;
};