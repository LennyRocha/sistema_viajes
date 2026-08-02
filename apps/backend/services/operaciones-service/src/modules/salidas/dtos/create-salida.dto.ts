import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  Min,
} from 'class-validator';

import { TipoSalida } from '../types/tipo-salida'; 
import { EstadoSalida } from '../types/estado-salida';

export class CreateSalidaDto {
  @IsInt({
    message: 'El autobús es obligatorio',
  })
  @Min(1, {
    message: 'Selecciona un autobús válido',
  })
  autobusId!: number;

  @IsInt({
    message: 'El conductor es obligatorio',
  })
  @Min(1, {
    message: 'Selecciona un conductor válido',
  })
  conductorId!: number;

  @IsInt({
    message: 'El viaje base es obligatorio',
  })
  @Min(1, {
    message: 'Selecciona un viaje base válido',
  })
  viajeBaseId!: number;

  @IsNotEmpty({
    message: 'La configuración del horario es obligatoria',
  })
  @IsObject({
    message:
      'La configuración del horario debe ser un objeto',
  })
  horario_configuracion!: Record<string, any>;

  @IsEnum(TipoSalida, {
    message: 'Tipo de salida inválido',
  })
  tipoSalida!: TipoSalida;

  @IsEnum(EstadoSalida, {
    message: 'Estado de salida inválido',
  })
  estadoSalida!: EstadoSalida;

  @IsNotEmpty({
    message: 'La configuración de precios es obligatoria',
  })
  @IsObject({
    message: 'Los precios deben ser un objeto',
  })
  precios!: Record<string, any>;
}