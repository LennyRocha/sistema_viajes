import { Institucion } from 'src/modules/instituciones/institucion.entity';
import { TipoAutobus } from 'src/modules/tipos_autobus/tipo_bus.entity';

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
