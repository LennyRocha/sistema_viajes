import { ViajeBaseApi } from "../../viajes/types/OperacionesApi";

export type TipoSalida = "UNICA" | "RECURRENTE" | "ESPECIAL";
export type EstadoSalida = "PROGRAMADO" | "EN_CURSO" | "FINALIZADO" | "CANCELADO";

export type InstitucionResumen = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  slug?: string | null;
  estatus?: boolean;
};

export type TipoAutobusResumen = {
  id?: number;
  nombre?: string;
  descripcion?: string | null;
  modelo?: string | null;
  slug?: string | null;
};

export type AutobusResumen = {
  id?: number;
  alias?: string;
  marca?: string;
  modelo?: string;
  descripcion?: string;
  ano?: number;
  capacidad?: number;
  color?: string;
  codigo_interno?: string;
  estado?: string;
  estatus?: boolean;
  institucion_id?: number;
  tipo_autobus_id?: number;
  institucion?: InstitucionResumen;
  tipoAutobus?: TipoAutobusResumen;
};

export type LicenciaResumen = {
  numero_licencia?: string;
  tipo?: string;
  fecha_vencimiento?: string;
  imagen_licencia?: string;
};

export type ConductorResumen = {
  id: number;
  nombres: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  curp?: string;
  telefono?: string;
  email?: string;
  foto_perfil?: string;
  institucion_id?: number;
  institucion?: InstitucionResumen;
  licencia?: LicenciaResumen | null;
  estatus?: boolean;
};

export type PrecioRutaSalida = {
  rutaId: number;
  orden: number;
  nombre: string;
  precio: number;
};

export type HorarioConfiguracionSalida =
  | {
      tipo: "UNICA";
      zonaHoraria: string;
      duracionMin: number;
      inicio: {
        fecha: string;
        hora: string;
        fechaHoraLocal: string;
      };
      finCalculado: {
        fecha: string;
        hora: string;
        fechaHoraLocal: string;
      };
    }
  | {
      tipo: "RECURRENTE";
      zonaHoraria: string;
      duracionMin: number;
      dias: Array<{
        dia: string;
        horarios: Array<{
          horaInicio: string;
          horaFinEstimada: string;
        }>;
      }>;
    }
  | {
      tipo: "ESPECIAL";
      zonaHoraria: string;
      duracionMin: number;
      ocurrencias: Array<{
        fecha: string;
        horaInicio: string;
        fechaHoraLocal: string;
        finCalculado: {
          fecha: string;
          hora: string;
          fechaHoraLocal: string;
        };
      }>;
    };

export type CreateSalidaBody = {
  autobusId: number;
  conductorId: number;
  viajeBaseId: number;
  horario_configuracion: HorarioConfiguracionSalida;
  tipoSalida: TipoSalida;
  estadoSalida: EstadoSalida;
  precios: {
    moneda: "MXN";
    rutas: PrecioRutaSalida[];
  };
};

export type SalidaCreada = CreateSalidaBody & {
  id?: number;
  estatus?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SalidaDetalle = {
  id: number;
  autobusId: number;
  conductorId: number;
  viajeBaseId: number;
  tipoSalida: TipoSalida;
  estadoSalida: EstadoSalida;
  estatus: boolean;
  horario_configuracion: Record<string, any>;
  horaSalida: string | null;
  lugarSalida: Record<string, any> | null;
  lugarLlegada: Record<string, any> | null;
  precio: number | null;
  precios: Record<string, any>;
  autobus: {
    id: number;
    alias?: string;
    marca?: string;
    modelo?: string;
    codigo_interno?: string;
    institucion?: {
      id?: number | null;
      nombre?: string | null;
      imagen_url?: string | null;
    } | null;
    servicios: Array<{
      id?: number | null;
      nombre?: string | null;
      descripcion?: string | null;
      icono_nombre?: string | null;
      activo?: boolean;
      config_servicio?: Record<string, any> | null;
    }>;
  } | null;
  viajeBase: {
    id: number;
    nombre?: string | null;
    descripcion?: string | null;
    estatus?: boolean;
    rutas: Array<{
      id: number;
      orden: number;
      rutaId: number;
      nombre?: string | null;
      origen?: Record<string, any> | null;
      destino?: Record<string, any> | null;
    }>;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type SalidaCatalogData = {
  viajes: ViajeBaseApi[];
  instituciones: InstitucionResumen[];
  autobuses: AutobusResumen[];
  conductores: ConductorResumen[];
  errores?: string[];
};
