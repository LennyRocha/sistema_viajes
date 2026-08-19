import { Auditory } from '@commons/types';
import {
  EstadoSalida,
  TipoSalida,
} from '../../../generated/prisma/client';

export default interface Salida extends Auditory {
  id?: number;

  /**
   * IDs provenientes de otros microservicios
   */
  autobusId: number;
  conductorId: number;

  /**
   * Viaje base (módulo local)
   */
  viajeBaseId: number;

  /**
   * Configuración del horario
   */
  horario_configuracion: Record<string, any>;

  /**
   * Tipo y estado de la salida
   */
  tipoSalida: TipoSalida;
  estadoSalida: EstadoSalida;

  /**
   * Lista de precios
   */
  precios: Record<string, any>;

  /**
   * Estado lógico
   */
  estatus: boolean;
}