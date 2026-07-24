import Institucion from "../../instituciones/types/Institucion";
import TipoAutobus from "../../tipos_autobus/types/TipoAutobus";

export interface DisponibilidadPorInstitucion {
  servicio: any;
  tipos: TipoAutobus[];
}

export interface DisponibilidadPorServicio {
  institucion: Institucion;
  tipos: TipoAutobus[];
}

export interface DisponibilidadPorTipo {
  institucion: Institucion;
  servicios: any[];
}
