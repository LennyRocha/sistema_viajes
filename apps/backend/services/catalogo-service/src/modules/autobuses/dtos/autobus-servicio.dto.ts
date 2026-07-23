import { IsNotEmpty, IsObject } from 'class-validator';

export class AutobusServicioDto {
  @IsNotEmpty({ message: 'El ID del servicio es obligatorio' })
  servicio_id!: number;
  @IsNotEmpty({ message: 'La configuración del servicio es obligatoria' })
  @IsObject({
    message: 'La configuración del servicio debe ser un objeto JSON válido',
  })
  config_servicio!: Record<string, any>;
}
